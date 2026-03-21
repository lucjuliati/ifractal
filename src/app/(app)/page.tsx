import { getData } from "@/lib/actions/get-data"
import { redirect } from "next/navigation"
import { Main } from "@/components/main"

type Props = {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

type Params = {
  days: string
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams as Params
  const days = params.days ? Number(params.days) : 7

  const data = await getData({ days }).catch((err) => {
    console.error(err)
    if (err?.status == 401) redirect("/logout")
  })

  if (!data) return null

  return <Main initialData={data} />
}
