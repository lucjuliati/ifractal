"use server"

import { baseUrl, isSecure } from "@/lib/utils/config"
import { parseCookie } from "@/lib/utils/cookie"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export async function loginAction(_: unknown, formData: FormData) {
  let token: string | undefined

  try {
    const login = formData.get("login") as string
    const password = formData.get("password") as string

    if (!login || !password) {
      return { error: "Usuário ou senha inválidos" }
    }

    const response = await fetch(baseUrl + "/conf/login.inc.php", {
      method: "POST",
      body: new URLSearchParams({
        primeiro_login: "true",
        login,
        senha: password
      })
    })

    const json = JSON.parse(await response.text())

    if (json?.success) {
      const parsedCookies = parseCookie(response.headers.getSetCookie())
      token = `${parsedCookies["STOU_Sistemas"]}:${login}`
    }

  } catch (err) {
    console.error(err)
    return { error: "Usuário ou senha inválidos" }
  }

  if (!token) {
    return { error: "Invalid credentials" }
  }

  const cookieStore = await cookies()
  cookieStore.set("s_token", token, {
    httpOnly: true,
    secure: isSecure,
    maxAge: 24 * 60 * 60
  })

  redirect("/")
}