
import parseCookie from "../utils/parseCookie.js"
import { baseUrl } from "../utils/config.js"
import { handleLastWeek } from "./lastWeek.js"

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

        const lastWeek = await handleLastWeek(req, res)
        const data = JSON.stringify({ ...json?.colab?.centro1, lastWeek })
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


export default new AppController()