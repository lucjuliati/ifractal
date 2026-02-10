import { Request } from "express"

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