"use client"

import { useCallback, useEffect, useState } from "react"
import { TimeClockData } from "@/lib/types"
import { useRouter } from "next/navigation"
import { Select } from "@/app/ui/select"

type Props = {
  data: TimeClockData
}

export function TimeClock({ data }: Props) {
  const router = useRouter()
  const [lunchBreakHours, setLunchBreakHours] = useState<number>(1)

  const getLunchBreak = useCallback(() => {
    try {
      const storedValue = Number.parseInt(localStorage.getItem("lunchBreak") ?? "1")
      if (storedValue && !isNaN(storedValue)) {
        setLunchBreakHours(storedValue)
      } else {
        localStorage.setItem("lunchBreak", "1")
        setLunchBreakHours(1)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("days")) {
      setTimeout(() => router.replace("/"), 250)
    }

    queueMicrotask(() => getLunchBreak())
  }, [data, router, getLunchBreak])

  const decimalToTime = (decimal: number) => {
    const hours = Math.floor(decimal)
    const minutes = Math.round((decimal - hours) * 60)

    if (hours.toString() === "NaN" || minutes.toString() === "NaN") {
      return "---"
    }

    return `${hours}h ${minutes < 10 ? "0" + minutes : minutes}min`
  }

  const preview = (originalDate: Date, decimal: number) => {
    if (!(originalDate instanceof Date) || isNaN(originalDate.getTime())) {
      throw new TypeError("Invalid input: originalDate must be a valid Date object.")
    }

    const hours = Math.floor(decimal)
    const minutes = Math.round((decimal - hours) * 60)
    const newDate = new Date(originalDate.getTime())
    const hoursInMs = hours * 60 * 60 * 1000
    const minutesInMs = minutes * 60 * 1000

    newDate.setTime(newDate.getTime() + (hoursInMs + minutesInMs))

    const hrs = newDate.getHours()
    const mins = newDate.getMinutes()

    if (data.dados.mcs.length == 4) {
      return "--:--"
    }

    return `${hrs}:${mins < 10 ? "0" + mins : mins}`
  }

  const handleLunchBreak = (value: string) => {
    const numberValue = Number.parseInt(value)

    if (isNaN(numberValue)) return

    setLunchBreakHours(numberValue)
    localStorage.setItem("lunchBreak", value)
  }

  const handleSpecialClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (data.user != "lucasvinicius") return
    
    if (e.altKey) {
      e.preventDefault()
      window.open("/phonto", "_blank", "noopener,noreferrer")
      return
    }
  }

  let timeLeft = Number(data.dados.previsto) - Number(data.dados.trabalhado)

  if (timeLeft < 0) timeLeft = 0

  if (data.dados.mcs?.length <= 2) {
    if (lunchBreakHours) {
      timeLeft += Number(lunchBreakHours)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-neutral-900 rounded-lg shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-semibold text-white">{data.dados.str_data}</h2>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-4">
          <div data-testid="worked-time">
            <p className="text-sm text-gray-400">Trabalhado</p>
            <p className="text-lg font-semibold text-white">{data.dados.tot_trabalhado}</p>
          </div>
          <div data-testid="worked-percentage">
            <p className="text-sm text-gray-400">Percentual</p>
            <p className="text-lg font-semibold text-white">{data.dados.perct_trabalhado}%</p>
          </div>
          <div data-testid="time-left">
            <p className="text-sm text-gray-400">Faltam</p>
            <p className="text-lg font-semibold text-white">{decimalToTime(timeLeft)}</p>
          </div>
          <div data-testid="preview">
            <p className="text-sm text-gray-400">Previsâo</p>
            <p className="text-lg font-semibold text-white">{preview(new Date(), timeLeft)}</p>
          </div>
        </div>

        <div className="mb-2">
          <Select
            options={[
              { value: "1", label: "1 Hora" },
              { value: "2", label: "2 Horas" },
            ]}
            value={lunchBreakHours.toString()}
            onChange={(value) => handleLunchBreak(value)}
            label="Horas de almoço"
          />
        </div>

        <div className="mb-4" data-testid="progress">
          <div className="flex justify-between text-sm mb-1 text-gray-300">
            <span>Progresso</span>
            <span>{data.dados.perct_trabalhado}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(data.dados.perct_trabalhado, 100)}%` }}
            />
          </div>
        </div>

        <div className="pt-1">
          <div className="flex flex-wrap gap-2" data-testid="points">
            {Array.from({ length: 4 }).map((_, idx) => {
              const point = data.dados.mcs[idx]

              return (
                <span
                  key={idx}
                  className={`px-3 py-1 rounded-md text-sm font-mono ${point ? "bg-blue-900/60 text-blue-100/90" : "bg-neutral-700/40 text-neutral-500"}`}>
                  {point ? point.replace("e", "") : "--:--"}
                </span>
              )
            })}
          </div>
        </div>
        <div className="mt-3 w-full flex justify-end">
          <a
            href="https://stou.ifractal.com.br/fulltime/phonto.php"
            target="_blank" rel="noopener noreferrer"
            onClick={(e) => handleSpecialClick(e)}>
            <button
              data-testid="register-btn"
              className="bg-[#3645c9] rounded py-1 px-[24px] text-white hover:brightness-[1.12] mt-5 cursor-pointer primary-btn">
              Registrar ponto
            </button>
          </a>
        </div>
      </div>
    </div>
  )
}