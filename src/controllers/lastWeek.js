
import { baseUrl } from "../utils/config.js"
import { calculateWorkedTime } from "./report.js"
import { isFuture, isWeekend, subDays } from "date-fns"
import { getToken } from "../utils/getToken.js"
import { Data } from "../schemas/data.js"

const isSecure = process.env.NODE_ENV === "production"

export async function handleLastWeek(req, res) {
  try {
    let data = null
    let canFetch = false
    let lastWeek = {}

    Array.from({ length: 12 }).reverse().forEach((_, i) => {
      const day = subDays(new Date(), i)
      const date = day.toISOString().split("T")[0]

      if (Object.keys(lastWeek).length < 7 && !isWeekend(day)) {
        lastWeek[date] = {
          date,
          isFuture: isFuture(`${day} 23:59:59`),
        }
      }
    })

    const days = {}
    const requests = []
    let total = 0

    if (!req.cookies?.last_week) {
      canFetch = true
    }

    if (!canFetch && req.cookies?.last_week) {
      const json = JSON.parse(req.cookies.last_week)
      storeDates(req, json)
      return json
    }

    for (const date in lastWeek) {
      let fetchDate = new Date(date)
      fetchDate.setDate(fetchDate.getDate() - 1)
      fetchDate = fetchDate.toISOString().split("T")[0]

      const { token } = getToken(req)

      if (lastWeek[date].isFuture === false) {
        requests.push(
          fetch(baseUrl + "/db/estrutura.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "Cookie": `STOU_Sistemas=${token}`
            },
            body: new URLSearchParams({
              cmd: "getDadosDashboardPrincipal",
              data: fetchDate,
              fn: "ponto_do_dia",
              k: "6PszETQa9etNUyJFS++JDYlmG+dLEHYYbfPuyJKrajA=",
              tp: "mais",
            })
          })
        )
      }
    }

    Object.keys(lastWeek).forEach(day => {
      days[day] = { ...lastWeek[day], formatted: null, total: 0 }
    })

    try {
      await Promise.all(requests).then(async (responses) => {
        for (let i = 0; i < responses.length; i++) {
          const response = await responses[i].text()

          const json = JSON.parse(response)
          const mcs = json?.ponto_resumo_dia?.mcs ?? []
          const workedTime = calculateWorkedTime(Object.keys(lastWeek)[i], mcs, false)
          const formatted = calculateWorkedTime(Object.keys(lastWeek)[i], mcs)
          const day = lastWeek[Object.keys(lastWeek)[i]]

          days[day.date] = { ...day, formatted, total: workedTime, points: mcs }

          if (i > 0 && !isNaN(workedTime)) {
            if (!isNaN((parseFloat(workedTime) - 8))) {
              total += (parseFloat(workedTime) - 8)
            } else {
              total += 8
            }
          }
        }
      })
    } catch (err) {
      console.error(err)
      res.clearCookie("session")
      return res.render("login")
    }

    const sign = total < 0 ? "-" : ""
    const abs = Math.abs(total)

    const hours = Math.floor(abs)
    const minutes = Math.round((abs - hours) * 60)

    data = { total: `${sign}${hours}h ${minutes}m`, data: days }

    if (data) {
      await res.cookie("last_week", JSON.stringify(data), {
        httpOnly: false,
        secure: isSecure,
        maxAge: 1800
      })
    } else {
      res.clearCookie("last_week", { httpOnly: false, secure: isSecure })
    }

    storeDates(req, data)
    return data
  } catch (err) {
    console.error(err)
    res.clearCookie("last_week", { httpOnly: false, secure: isSecure })

    return null
  }
}

export async function getStoredDates(req) {
  try {
    const { user } = getToken(req)

    if (!user) throw new Error("Invalid user")

    const data = await Data.find({ user }).sort({ date: -1 }).limit(30)
    let total = 0

    for (let i = 0; i < data.length; i++) {
      const workedTime = calculateWorkedTime(data[i].key, data[i]?.points, false)
      const formatted = calculateWorkedTime(data[i].key, data[i]?.points)
      data[i].formatted = formatted

      if (i > 0 && !isNaN(workedTime)) {
        if (!isNaN((parseFloat(workedTime) - 8))) {
          total += (parseFloat(workedTime) - 8)
        } else {
          total += 8
        }
      }
    }

    const sign = total < 0 ? "-" : ""
    const abs = Math.abs(total)
    const hours = Math.floor(abs)
    const minutes = Math.round((abs - hours) * 60)

    return { data, total: `${sign}${hours}h ${minutes}m` }
  } catch (err) {
    console.error(err)
    return []
  }
}

export async function storeDates(req, dates) {
  try {
    const { user } = getToken(req)

    if (!user) throw new Error("Invalid user")

    Object.entries(dates?.data)?.forEach(async ([key, value]) => {
      const item = await Data.findOne({ user, key })

      if (!item) {
        await Data.create({
          user,
          date: new Date(`${value.date} 12:00:00`),
          key: key,
          points: value?.points ?? [],
          total: value?.formatted,
        })
      } else {
        item.date = new Date(`${value.date} 12:00:00`)
        item.key = key
        item.points = value?.points ?? []
        item.total = value?.formatted

        await item.save()
      }
    })
  } catch (err) {
    console.error(err)
  }
}