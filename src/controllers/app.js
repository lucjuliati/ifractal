
import { baseUrl } from "../utils/config.js"
import { handleLastWeek } from "./lastWeek.js"
import { getToken } from "../utils/getToken.js"

const isSecure = process.env.NODE_ENV === "production"

class AppController {
  async index(req, res) {
    if (req.cookies?.session) {
      const { user, token } = getToken(req)

      fetch(baseUrl + "/db/estrutura.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cookie": `STOU_Sistemas=${token}`
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
          req.user = user

          res.clearCookie("session", {
            httpOnly: true,
            secure: isSecure,
          })

          return res.render("login")
        } else {
          json = JSON.parse(text)
        }

        const lastWeek = await handleLastWeek(req, res)

        const data = JSON.stringify({
          ...json?.colab?.centro1,
          user,
          lastWeek
        })
        return res.render("home", { data })
      }).catch(console.error)
    } else {
      return res.render("login")
    }
  }

  async data(req, res) {
    if (req.cookies?.session) {
      const { token } = getToken(req)

      fetch(baseUrl + "/db/estrutura.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cookie": `STOU_Sistemas=${token}`
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
      console.error("No session")
      return res.status(400).send()
    }
  }
}


export default new AppController()