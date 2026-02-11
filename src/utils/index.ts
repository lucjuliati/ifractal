import { Request } from "express"

export const baseUrl: string = "https://stou.ifractal.com.br/fulltime"

export const isSecure: boolean = process.env.NODE_ENV === "production"

export function getToken(req: Request): { token: string, user: string } {
  try {
    const split = req.cookies.session.split(":")
    const token = split[0]
    const user = split[1]

    return { token, user }
  } catch (err) {
    throw err
  }
}

export function parseCookie(cookies: Request["cookies"]) {
  const json: { [key: string]: string } = {}

  if (!Array.isArray(cookies) || cookies.length === 0) {
    return json
  }

  cookies.forEach(cookie => {
    const cookiePart = cookie.split(";")[0]

    if (cookiePart) {
      const [name, ...values] = cookiePart.split("=")
      const trimmedName: string = name.trim()

      if (trimmedName) {
        json[trimmedName] = values.join("=").trim()
      }
    }
  })

  return json
}
