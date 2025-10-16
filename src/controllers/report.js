import { baseUrl } from "../utils/config.js"
import { differenceInMinutes } from "date-fns"

const isSecure = process.env.NODE_ENV === "production"

export function calculateWorkedTime(date, mcs, format = true) {
  let timestamps = mcs?.map(time => `${date} ${time}`)
  let hours = 0
  let minutes = 0
  let total = 0
  
  if (mcs.length === 1) {
    const now = `${date} ${new Date().toLocaleTimeString([], {
      timeZone: "America/Sao_Paulo"
    }).substring(0, 5)}`
    total = Math.abs(differenceInMinutes(now, timestamps[0]) / 60)

    hours = Math.floor(total)
    minutes = Math.round((total - hours) * 60)
  } else if (mcs.length === 2) {
    const difference = differenceInMinutes(timestamps[1], timestamps[0]) / 60
    total = difference
    hours = Math.floor(total)
    minutes = Math.round((total - hours) * 60)
  } else if (mcs.length === 3) {
    const now = `${date} ${new Date().toLocaleTimeString([], {
      timeZone: "America/Sao_Paulo"
    }).substring(0, 5)}`
    const difference1 = differenceInMinutes(timestamps[1], timestamps[0]) / 60
    const difference2 = differenceInMinutes(now, timestamps[2]) / 60

    total = difference1 + difference2
    hours = Math.floor(total)
    minutes = Math.round((total - hours) * 60)
  } else {
    const difference1 = differenceInMinutes(timestamps[1], timestamps[0]) / 60
    const difference2 = differenceInMinutes(timestamps[3], timestamps[2]) / 60
    total = difference1 + difference2

    hours = Math.floor(total)
    minutes = Math.round((total - hours) * 60)
    minutes = Math.abs(minutes)
  }

  if (format) {
    return `${hours}h ${minutes < 10 ? "0" + minutes : minutes}min`
  } else {
    return Math.abs(total).toFixed(2)
  }
}

class ReportController {
  decimalToTimeFormatted = (decimal) => {
    const hours = Math.floor(decimal)
    const minutes = Math.round((decimal - hours) * 60)

    return `${hours}h ${minutes < 10 ? "0" + minutes : minutes}min`
  }

  byDate = async (req, res) => {
    const date = req.query.date

    if (!req.cookies?.session) {
      return res.status(400).send()
    }

    if (!date) {
      return res.status(400).send()
    }

    await fetch(baseUrl + "/db/estrutura.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": `STOU_Sistemas=${req.cookies.session}`
      },
      body: new URLSearchParams({
        cmd: "getDadosDashboardPrincipal",
        data: date,
        fn: "ponto_do_dia",
        k: "6PszETQa9etNUyJFS++JDYlmG+dLEHYYbfPuyJKrajA=",
        tp: "mais",
      })
    }).then(async (data) => {
      const response = await data.text()
      let json = {}

      if (response.includes("<html>")) {
        res.clearCookie("session", {
          httpOnly: true,
          secure: isSecure,
        })

        return res.render("login")
      } else {
        json = JSON.parse(response)
        const mcs = json?.ponto_resumo_dia?.mcs ?? []

        json.ponto_resumo_dia.totalWorkedTime = calculateWorkedTime(date, mcs)
      }

      return res.status(200).json(json.ponto_resumo_dia)
    }).catch((err) => {
      console.error(err)

      return res.status(500).send()
    })
  }
}

export default new ReportController()