import { addDays, isFuture, startOfWeek } from "date-fns"
import parseCookie from "../utils/parseCookie.js"
import { calculateWorkedTime } from "./report.js"
import { baseUrl } from "../utils/config.js"

const isSecure = process.env.NODE_ENV === "production"

class AppController {
  async login(req, res) {
    if (Buffer.isBuffer(req.body)) {
      req.body = JSON.parse(req.body)
    }

    const body = new URLSearchParams({
      primeiro_login: true,
      login: req.body.email,
      senha: req.body.password
    })

    fetch(baseUrl + "/conf/login.inc.php", {
      method: "POST",
      body: body
    }).then(async (data) => {
      try {
        const json = JSON.parse(await data.text())

        if (json?.success) {
          const cookies = parseCookie(data.headers.getSetCookie())

          res.cookie("session", cookies["STOU_Sistemas"], {
            httpOnly: true,
            secure: isSecure,
            maxAge: 24 * 60 * 60 * 1000
          })

          res.status(200).send({ message: "Ok" })
        } else {
          throw new Error("Invalid data")
        }
      } catch (err) {
        throw new Error(err)
      }
    }).catch((err) => {
      console.error(err)
      res.status(400).json({ error: "Usuário ou senha incorretos!" })
    })
  }

  async index(req, res) {
      res.clearCookie("work_week", { httpOnly: false, secure: isSecure })

    if (req.cookies?.session) {
      fetch(baseUrl + "/db/estrutura.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cookie": `STOU_Sistemas=${req.cookies.session}`
        },
        body: new URLSearchParams({
          cmd: "getDadosDashboardPrincipal",
          sistema: "ifponto",
          k: "VEooMo4B0BbPpgcq0ajJ/5Gaft9t6S3lHOSMdazUhLE="
        })
      }).then(async (response) => {
        const text = await response.text()
        let json = {}

        if (text.includes("<html")) {
          res.clearCookie("session", {
            httpOnly: true,
            secure: isSecure,
          })

          return res.render("login")
        } else {
          json = JSON.parse(text)
        }

        const workWeek = await handleWorkWeek(req, res)
        const data = JSON.stringify({ ...json?.colab?.centro1, workWeek })
        return res.render("home", { data })
      }).catch(console.error)
    } else {
      return res.render("login")
    }
  }

  async data(req, res) {
    if (req.cookies?.session) {
      fetch(baseUrl + "/db/estrutura.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cookie": `STOU_Sistemas=${req.cookies.session}`
        },
        body: new URLSearchParams({
          cmd: "getDadosDashboardPrincipal",
          sistema: "ifponto",
          k: "VEooMo4B0BbPpgcq0ajJ/5Gaft9t6S3lHOSMdazUhLE="
        })
      }).then(async (data) => {
        const response = await data.text()
        let json = {}

        if (response.includes("<html")) {
          res.clearCookie("session", {
            httpOnly: true,
            secure: isSecure,
          })

          return res.render("login")
        } else {
          json = JSON.parse(response)
        }

        return res.status(200).json({
          data: json?.colab?.centro1
        })
      }).catch(console.error)
    } else {
      return res.status(400).send()
    }
  }
}

async function handleWorkWeek(req, res) {
  try {
    let data = null
    let canFetch = false

    function generateWeek() {
      const today = new Date("2025-09-04")
      // const today = new Date()
      const monday = startOfWeek(today, { weekStartsOn: 1 })
      let week = {}

      Array.from({ length: 5 }, (_, i) => {
        const day = addDays(monday, i)
        const date = day.toISOString().split("T")[0]

        week[date] = {
          date,
          isFuture: isFuture(day),
        }
      })

      return week
    }

    const workWeek = generateWeek()
    const days = {}
    const requests = []
    let total = 0

    if (!req.cookies?.work_week) {
      canFetch = true
    } else {
      const cookieWeek = JSON.parse(req.cookies.work_week)?.data

      const cachedKeys = Object.keys(cookieWeek).map(key => {
        return `${cookieWeek[key].date}${cookieWeek[key].isFuture ? "f" : "p"}`
      }).join("|")

      const keys = Object.keys(workWeek).map(key => {
        return `${workWeek[key].date}${workWeek[key].isFuture ? "f" : "p"}`
      }).join("|")

      if (cachedKeys !== keys) {
        canFetch = true
      }
    }

    if (!canFetch && req.cookies?.work_week) {
      return JSON.parse(req.cookies.work_week)
    }

    for (const date in workWeek) {
      let fetchDate = new Date(date)
      fetchDate.setDate(fetchDate.getDate() - 1)
      fetchDate = fetchDate.toISOString().split("T")[0]

      if (workWeek[date].isFuture === false) {
        requests.push(
          fetch(baseUrl + "/db/estrutura.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "Cookie": `STOU_Sistemas=${req.cookies.session}`
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

    await Promise.all(requests).then(async (responses) => {
      for (let i = 0; i < responses.length; i++) {
        const response = await responses[i].text()
        const json = JSON.parse(response)
        const mcs = json?.ponto_resumo_dia?.mcs ?? []
        const workedTime = calculateWorkedTime(Object.keys(workWeek)[i], mcs, false)
        const formatted = calculateWorkedTime(Object.keys(workWeek)[i], mcs)
        const day = workWeek[Object.keys(workWeek)[i]]

        days[day.date] = { ...day, formatted, total: workedTime }

        total += (parseFloat(workedTime) - 8)
      }
    })
    
    const sign = total < 0 ? "-" : ""
    const abs = Math.abs(total)

    const hours = Math.floor(abs)
    const minutes = Math.round((abs - hours) * 60)

    data = { total: `${sign}${hours}h ${minutes}m`, data: days }

    if (data) {
      await res.cookie("work_week", JSON.stringify(data), {
        httpOnly: false,
        secure: isSecure,
        maxAge: 7 * (24 * 60 * 60 * 1000)
      })
    } else {
      res.clearCookie("work_week", { httpOnly: false, secure: isSecure })
    }

    return data
  } catch (err) {
    console.error(err)
    res.clearCookie("work_week", { httpOnly: false, secure: isSecure })

    return null
  }
}

export default new AppController()