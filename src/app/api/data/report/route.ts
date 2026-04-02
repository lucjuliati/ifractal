import { NextResponse } from "next/server"
import { format } from "@/lib/actions/calculate-worked-time"
import { deleteToken, getToken } from "@/lib/utils/session"
import { baseUrl } from "@/lib/utils/config"
import { redirect } from "next/navigation"

type Params = {
  params: Promise<{ date?: string }>
}

export const GET = async (_: Request, { params }: Params) => {
  try {
    const { date } = await params
    const { user, token } = await getToken()

    if (!user || !token) return NextResponse.json(null, { status: 401 })

    if (!date) {
      return NextResponse.json(null, { status: 400 })
    }

    await fetch(baseUrl + "/db/estrutura.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": `STOU_Sistemas=${token}`
      },
      body: new URLSearchParams({
        cmd: "getDadosDashboardPrincipal",
        data: date as string,
        fn: "ponto_do_dia",
        k: "6PszETQa9etNUyJFS++JDYlmG+dLEHYYbfPuyJKrajA=",
        tp: "mais",
      })
    }).then(async (data) => {
      const response = await data.text()
      let json = {} as {
        ponto_resumo_dia: {
          totalWorkedTime: string,
          mcs: string[]
        }
      }

      if (response.includes("<html>")) {
        await deleteToken()
        return redirect("/login")
      } else {
        json = JSON.parse(response)
        const mcs = json?.ponto_resumo_dia?.mcs ?? []

        json.ponto_resumo_dia.totalWorkedTime = format(date, mcs as string[])
      }

      return NextResponse.json(json.ponto_resumo_dia, { status: 200 })
    }).catch((err) => {
      console.error(err)
      return NextResponse.json(null, { status: 500 })
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(null, { status: 400 })
  }
}