import { deleteToken } from "@/lib/utils/session"
import { redirect } from "next/navigation"

export async function GET() {
  await deleteToken()
  redirect("/login")
}
