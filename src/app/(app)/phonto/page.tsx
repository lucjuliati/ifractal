import { getToken } from "@/lib/utils/session"
import { Form } from "./form"

export const metadata = {
  title: "STOU Powered by ifPonto - Registro pelo Navegador",
}

export default async function Page() {
  const { user } = await getToken()

  return (
    <div className="w-full h-dvh bg-[#000000] flex justify-center items-center">
      <Form user={user} />
    </div>
  )
}