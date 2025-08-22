import { baseUrl } from "../utils/config.js"
import { differenceInMinutes } from "date-fns"

const isSecure = process.env.NODE_ENV === "production"

class ReportController {
  decimalToTime = (decimal) => {
    const hours = Math.floor(decimal)
    const minutes = Math.round((decimal - hours) * 60)

    return `${hours}h ${minutes < 10 ? "0" + minutes : minutes}min`
  }

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

        if (mcs.length === 4) {
          let timestamps = mcs?.map(time => {
            return `${date} ${time}`
          })

          const difference1 = differenceInMinutes(timestamps[1], timestamps[0]) / 60
          const difference2 = differenceInMinutes(timestamps[3], timestamps[2]) / 60
          const total = difference1 + difference2

          json.ponto_resumo_dia.totalWorkedTime = this.decimalToTime(total)
        }
      }

      return res.status(200).json(json.ponto_resumo_dia)
    }).catch((err) => {
      console.error(err)

      return res.status(500).send()
    })
  }
}

export default new ReportController()