"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { TimeClock } from "@/components/time-clock"
import { History } from "@/components/history"
import { Chart } from "@/components/chart"
import { useRouter } from "next/navigation"
import { TimeClockData } from "@/lib/types"

type Props = {
  initialData: string
}

export function Main({ initialData }: Props) {
  const router = useRouter()
  const [data, setData] = useState<TimeClockData>(JSON.parse(initialData))
  const intervalRef = useRef<NodeJS.Timeout>(null)

  const fetchData = useCallback(async () => {
    try {
      if (document.hidden) return
      console.log("fetching data")

      const params = new URLSearchParams(window.location.search)
      const days = params.get("days")
      let url = "/api/data"

      if (days) {
        url += `?days=${days}`
      }

      const res = await fetch(url)
      console.log(res.status)
      if (res.status === 401) {
        router.push("/logout")
      } else {
        document.dispatchEvent(new CustomEvent("data-ready", {}))
      }

      const json = JSON.parse(await res.json()) as TimeClockData
      setData(json)
    } catch (err) {
      console.error(err)
    }
  }, [router])

  useEffect(() => {
    intervalRef.current = setInterval(() => fetchData(), 60_000)

    window.addEventListener("focus", fetchData)

    return () => {
      window.removeEventListener("focus", fetchData)
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchData])

  return (
    <div className="grid grid-cols-2 pt-6 md:px-[10px] lg:px-[12vw] max-[1000px]:grid-cols-1">
      <div>
        <TimeClock data={data!} />
        <Chart data={data.days.data} />
      </div>
      <div>
        <History data={data!} />
      </div>
    </div>
  )
}