
import { baseUrl } from "../utils/config.js"
import { calculateWorkedTime } from "./report.js"
import { isFuture, isWeekend, subDays } from "date-fns"
import { getToken } from "../utils/getToken.js"

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
      return JSON.parse(req.cookies.last_week)
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
          const key = Object.keys(lastWeek)[i]
          const response = await responses[i].text()

          const json = JSON.parse(response)
          const mcs = json?.ponto_resumo_dia?.mcs ?? []
          const workedTime = calculateWorkedTime(key, mcs, false)

          const formatted = calculateWorkedTime(key, mcs)
          const day = lastWeek[key]

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
        maxAge: 600
      })
    } else {
      res.clearCookie("last_week", { httpOnly: false, secure: isSecure })
    }

    return data
  } catch (err) {
    console.error(err)
    res.clearCookie("last_week", { httpOnly: false, secure: isSecure })

    return null
  }
}
