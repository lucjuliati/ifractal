
import parseCookie from "../utils/parseCookie"
import { baseUrl } from "../utils/config"
import { Request, Response } from "express"

const isSecure = process.env.NODE_ENV === "production"

class AuthController {
  async login(req: Request, res: Response) {
    if (Buffer.isBuffer(req.body)) {
      req.body = JSON.parse(req.body.toString())
    }

    const body = new URLSearchParams({
      primeiro_login: "true",
      login: req.body.login,
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
          const session = `${cookies["STOU_Sistemas"]}:${req.body.login}`

          res.cookie("session", session, {
            httpOnly: true,
            secure: isSecure,
            maxAge: 24 * 60 * 60 * 1000
          })

          res.status(200).send({ message: "Ok" })
        } else {
          throw new Error("Invalid data")
        }
      } catch (err) {
        throw err
      }
    }).catch((err) => {
      console.error(err)
      res.status(400).json({ error: "Usuário ou senha incorretos!" })
    })
  }
}

export default new AuthController()