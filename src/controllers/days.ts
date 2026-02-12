
import { baseUrl, isSecure, getToken } from "../utils"
import { calculateWorkedTime, format } from "./report"
import { isFuture, isWeekend, subDays } from "date-fns"
import { Request, Response } from "express"
import { TTLCache } from "../utils/cache"


type Day = {
  date: string
  isFuture: boolean
  formatted: string | number | null
  total: string | number | null
  points?: string[]
}

export async function handleLastWeek(req: Request, res: Response) {
  try {
    let data = null
    let lastWeek: { [key: string]: { date: string, isFuture: boolean } } = {}
    const { user } = getToken(req)
    let count: number = 7

    if (req.query?.days) {
      count = Number(req.query.days)
      if (count < 7) count = 7
      if (count > 30) count = 30
    }
    
    Array.from({ length: (count + 5) }).reverse().forEach((_, i) => {
      const day = subDays(new Date(), i)
      const date = day.toISOString().split("T")[0]

      if (Object.keys(lastWeek).length < count && !isWeekend(day)) {
        lastWeek[date] = {
          date,
          isFuture: isFuture(`${day} 23:59:59`),
        }
      }
    })

    const days: { [key: string]: Day } = {}
    const requests = []
    let total = 0
    const cache = TTLCache.getInstance()

    if (cache.get(user)) {
      return cache.get(user)
    }

    for (const day in lastWeek) {
      let fetchDate = new Date(day)
      fetchDate.setDate(fetchDate.getDate() - 1)

      const { token } = getToken(req)

      if (lastWeek[day].isFuture === false) {
        requests.push(
          fetch(baseUrl + "/db/estrutura.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "Cookie": `STOU_Sistemas=${token}`
            },
            body: new URLSearchParams({
              cmd: "getDadosDashboardPrincipal",
              data: fetchDate.toISOString().split("T")[0],
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
          const workedTime = calculateWorkedTime(key, mcs)
          const formatted = format(key, mcs)
          const day = lastWeek[key]

          days[day.date] = { ...day, formatted, total: workedTime, points: mcs }

          if (i > 0 && !isNaN(Number(workedTime))) {
            if (!isNaN((parseFloat(workedTime?.toString()!) - 8))) {
              total += (parseFloat(workedTime?.toString()!) - 8)
            } else {
              total += 8
            }
          }
        }
      })
    } catch (err) {
      console.error(err)
      res.clearCookie("session", {
        httpOnly: true,
        secure: isSecure,
      })
      return res.render("login")
    }

    const sign = total < 0 ? "-" : ""
    const abs = Math.abs(total)

    const hours = Math.floor(abs)
    const minutes = Math.round((abs - hours) * 60)

    data = { total: `${sign}${hours}h ${minutes}m`, data: days }

    cache.set(user, data, 30_0000)

    return data
  } catch (err) {
    console.error(err)

    return null
  }
}
