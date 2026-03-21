import { getToken } from "@/lib/utils/session"
import { redirect } from "next/navigation"
import LoginForm from "./form"

export default async function Login() {
  const { user } = await getToken()

  if (user) redirect("/")

  return (<LoginForm />)
}
