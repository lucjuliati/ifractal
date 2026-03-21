import { NextResponse } from "next/server"
import { getToken } from "@/lib/utils/session"
import { getData } from "@/lib/actions/get-data"

export const GET = async () => {
  try {
    const { user, token } = await getToken()

    if (!user || !token) return NextResponse.json(null, { status: 401 })

    const data = await getData()
    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error(err)
    const error = err as { status: number }
    return NextResponse.json(null, { status: error.status ?? 400 })
  }
}