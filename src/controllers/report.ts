import { baseUrl, isSecure } from "../utils/config"
import { differenceInMinutes } from "date-fns"
import { getToken } from "../utils/getToken"
import { Request, Response } from "express"

export function calculateWorkedTime(date: string, points: string[]): number | null {
  const myOffset = '-03:00'

  let timestamps = points?.map(time => `${date}T${time}:00${myOffset}`)
  let hours = 0
  let minutes = 0
  let total = 0

  if (points.length % 2 !== 0) {
    const d = new Date()
    const h = d.toLocaleTimeString('en-GB', { timeZone: 'America/Sao_Paulo', hour: '2-digit' })
    const m = d.toLocaleTimeString('en-GB', { timeZone: 'America/Sao_Paulo', minute: '2-digit' })
    const nowTime = `${h}:${m}`
    const now = `${date}T${nowTime}:00${myOffset}`

    if (points.length === 1) {
      total = Math.abs(differenceInMinutes(now, timestamps[0]) / 60)
    } else {
      const difference1 = differenceInMinutes(timestamps[1], timestamps[0]) / 60
      const difference2 = differenceInMinutes(now, timestamps[2]) / 60

      total = difference1 + difference2
    }
    hours = Math.floor(total)
    minutes = Math.round((total - hours) * 60)
  } else if (points.length > 0) {
    if (points.length === 2) {
      const difference = differenceInMinutes(timestamps[1], timestamps[0]) / 60
      total = difference
    } else {
      const difference1 = differenceInMinutes(timestamps[1], timestamps[0]) / 60
      const difference2 = differenceInMinutes(timestamps[3], timestamps[2]) / 60
      total = difference1 + difference2
    }

    hours = Math.floor(total)
    minutes = Math.round((total - hours) * 60)
    minutes = Math.abs(minutes)
    hours = Math.abs(hours)
  }


  return Number(Math.abs(total).toFixed(2))
}

export function decimalToTime(decimal: number) {
  const hours = Math.floor(decimal)
  const minutes = Math.round((decimal - hours) * 60)

  return `${hours}h ${minutes < 10 ? "0" + minutes : minutes}min`
}

export function format(date: string, points: string[]) {
  return decimalToTime(calculateWorkedTime(date, points) as number)
}

class ReportController {


  byDate = async (req: Request, res: Response) => {
    const { date } = req.query as { date: string }

    if (!req.cookies?.session) {
      return res.status(400).send()
    }

    if (!date) {
      return res.status(400).send()
    }

    const { token } = getToken(req)

    if (!token) {
      return res.status(400).send()
    }

    await fetch(baseUrl + "/db/estrutura.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": `STOU_Sistemas=${token}`
      },
      body: new URLSearchParams({
        cmd: "getDadosDashboardPrincipal",
        data: date as string,
        fn: "ponto_do_dia",
        k: "6PszETQa9etNUyJFS++JDYlmG+dLEHYYbfPuyJKrajA=",
        tp: "mais",
      })
    }).then(async (data) => {
      const response = await data.text()
      let json = {} as {
        ponto_resumo_dia: {
          totalWorkedTime: string,
          mcs: string[]
        }
      }

      if (response.includes("<html>")) {
        res.clearCookie("session", {
          httpOnly: true,
          secure: isSecure,
        })

        return res.render("login")
      } else {
        json = JSON.parse(response)
        const mcs = json?.ponto_resumo_dia?.mcs ?? []

        json.ponto_resumo_dia.totalWorkedTime = format(date, mcs as string[])
      }

      return res.status(200).json(json.ponto_resumo_dia)
    }).catch((err) => {
      console.error(err)

      return res.status(500).send()
    })
  }
}

export default new ReportController()