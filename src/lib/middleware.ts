import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getToken } from "./utils/session"

export type CustomRequest = NextRequest & { user?: string }

export type Handler<T = Record<string, string>> = (
  req: CustomRequest,
  context?: { params: Promise<T> }
) => Promise<Response>

export const withMiddleware = <T>(handler: Handler<T>): Handler<T> => async (req, context) => {
  try {
    const session = (await cookies()).get("session")

    if (!session) throw { message: "Unauthorized", status: 401 }

    const { user } = await getToken()

    if (!user) throw { message: "Unauthorized", status: 401 }

    req.user = user

    return (await handler(req, context))
  } catch (err) {
    console.error(err)
    const error = err as { message: string, status: number }

    if (error.status === 401) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    return NextResponse.json({ message: "Internal Server Error" }, {
      status: 500
    })
  }
}