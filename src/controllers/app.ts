
import { baseUrl, isSecure } from "../utils"
import { Request, Response } from "express"
import { handleLastWeek } from "./days"
import { getToken } from "../utils"

class AppController {
  async index(req: Request, res: Response) {
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
        let json = {} as { colab?: { centro1: {} } }

        if (text.includes("<html")) {
          (req as Request & { user?: string }).user = user

          res.clearCookie("session", {
            httpOnly: true,
            secure: isSecure,
          })

          return res.render("login")
        } else {
          json = JSON.parse(text)
        }

        const data = JSON.stringify({
          ...json?.colab?.centro1,
          days: await handleLastWeek(req, res),
          user,
        })
        return res.render("home", { data })
      }).catch(console.error)
    } else {
      return res.render("login")
    }
  }

  async data(req: Request, res: Response) {
    if (!req.cookies?.session) {
      console.error("No session")
      return res.status(400).send()
    }

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
    }).then(async (data) => {
      const response = await data.text()
      let json = {} as { colab?: { centro1: {} } }

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
        ...json?.colab?.centro1,
        days: await handleLastWeek(req, res),
        user
      })
    }).catch(console.error)
  }
}

export default new AppController()