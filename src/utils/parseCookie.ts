import { Request } from "express"

export default function parseCookie(cookies: Request["cookies"]) {
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
