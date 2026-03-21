import { baseUrl } from "@/lib/utils/config"
import { getToken } from "@/lib/utils/session"
import { handleInterval } from "./handle-interval"
import { cookies } from "next/headers"

export async function getData({ days }: { days?: number } = { days: 7 }): Promise<string | undefined> {
  return new Promise(async (resolve, reject) => {
    const cookieStore = await cookies()
    const session = cookieStore.get("s_token")?.value

    if (!session) {
      reject({ status: 401, message: "Unauthorized" })
    }

    const { user, token } = await getToken()

    let data

    await fetch(baseUrl + "/db/estrutura.php", {
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
      let json = {} as { colab?: { centro1: Record<string, unknown> } }

      if (text.includes("<html")) {
        reject({ status: 401, message: "Unauthorized" })
      } else {
        json = JSON.parse(text)
      }

      data = JSON.stringify({
        ...json?.colab?.centro1,
        days: await handleInterval({ days: days ?? 7 }),
        user,
      })
    }).catch(console.error)

    resolve(data)
  })
}