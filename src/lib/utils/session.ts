import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { isSecure } from "./config"

const KEY = "s_token"

export async function createToken(token: string) {
  try {
    const cookieStore = await cookies()
    cookieStore.set(KEY, token, {
      httpOnly: true,
      secure: isSecure,
      maxAge: 24 * 60 * 60 * 1000
    })
  } catch (err) {
    console.error(err)
    redirect("/")
  }
}

export async function getToken(): Promise<{ token: string | null, user: string | null }> {
  const cookieStore = await cookies()

  try {
    const session = cookieStore.get(KEY)?.value

    if (!session) {
      return { token: null, user: null }
    }

    const split = session.split(":")
    const token = split[0]
    const user = split[1]

    return { token, user }
  } catch (err) {
    console.error(err)
  }

  return { token: null, user: null }
}

export async function deleteToken() {
  const cookieStore = await cookies()
  cookieStore.delete(KEY)
}