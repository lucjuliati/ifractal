import { calculateWorkedTime, format } from "./calculate-worked-time"
import { isFuture, isWeekend, subDays } from "date-fns"
import { getToken } from "@/lib/utils/session"
import { baseUrl } from "@/lib/utils/config"
import { TTLCache } from "@/lib/utils/cache"
import { redirect } from "next/navigation"

type Day = {
  date: string
  isFuture: boolean
  formatted: string | number | null
  total: string | number | null
  points?: string[]
}

type HandleIntervalParams = {
  days?: number
}

function clampDays(days?: number): number {
  const count = days ?? 7
  return Math.max(7, Math.min(30, count)) + 5
}

function buildWorkdayRange(count: number): Record<string, { date: string; isFuture: boolean }> {
  const range: Record<string, { date: string; isFuture: boolean }> = {}

  Array.from({ length: count + 5 }).forEach((_, i) => {
    if (Object.keys(range).length >= count) return

    const day = subDays(new Date(), i)
    const date = day.toISOString().split("T")[0]

    if (!isWeekend(day)) {
      range[date] = { date, isFuture: isFuture(`${day} 23:59:59`) }
    }
  })

  return range
}

function fetchDayData(day: string, token: string | null): Promise<Response> {
  const fetchDate = new Date(day)
  fetchDate.setDate(fetchDate.getDate() - 1)

  return fetch(baseUrl + "/db/estrutura.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": `STOU_Sistemas=${token}`,
    },
    body: new URLSearchParams({
      cmd: "getDadosDashboardPrincipal",
      data: fetchDate.toISOString().split("T")[0],
      fn: "ponto_do_dia",
      k: "6PszETQa9etNUyJFS++JDYlmG+dLEHYYbfPuyJKrajA=",
      tp: "mais",
    }),
  })
}

async function processResponses(
  responses: Response[],
  lastWeek: Record<string, { date: string; isFuture: boolean }>
): Promise<{ interval: Record<string, Day>; total: number }> {
  const keys = Object.keys(lastWeek)
  const interval: Record<string, Day> = {}

  for (const day of keys) {
    interval[day] = { ...lastWeek[day], formatted: null, total: 0 }
  }

  let total = 0

  for (let i = 0; i < responses.length; i++) {
    const key = keys[i]
    const response = await responses[i].text()
    const json = JSON.parse(response)
    const mcs = json?.ponto_resumo_dia?.mcs ?? []

    const workedTime = calculateWorkedTime(key, mcs)
    const formatted = format(key, mcs)

    interval[lastWeek[key].date] = {
      ...lastWeek[key],
      formatted,
      total: workedTime,
      points: mcs,
    }

    if (i > 0 && workedTime !== null && !isNaN(Number(workedTime))) {
      const diff = parseFloat(workedTime.toString()) - 8
      if (!isNaN(diff)) {
        total += diff
      } else {
        total += 8
      }
    }
  }

  return { interval, total }
}

function formatTotal(total: number): string {
  const sign = total < 0 ? "-" : ""
  const abs = Math.abs(total)
  const hours = Math.floor(abs)
  const minutes = Math.round((abs - hours) * 60)
  return `${sign}${hours}h ${minutes}m`
}

export async function handleInterval({ days }: HandleIntervalParams) {
  try {
    const { user, token } = await getToken()
    const cache = TTLCache.getInstance()

    const cached = cache.get(user)
    if (cached) return cached

    const count = clampDays(days)
    
    const lastWeek = buildWorkdayRange(count)

    const requests = Object.keys(lastWeek)
      .filter((day) => !lastWeek[day].isFuture)
      .map((day) => fetchDayData(day, token))
    
    try {
      const responses = await Promise.all(requests)
      const { interval, total } = await processResponses(responses, lastWeek)
      const data = { total: formatTotal(total), data: interval }

      cache.set(user!, data, 30_0000)
      return data
    } catch {
      redirect(user || token ? "/logout" : "/login")
    }
  } catch {
    return null
  }
}
