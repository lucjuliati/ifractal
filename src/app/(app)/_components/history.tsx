"use client"

import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { LocalDaysData, StoredRecord, TimeClockData } from "@/lib/types"
import { DatabaseContext } from "@/lib/context/database"

function formatTotal(total: number): string {
  const sign = total < 0 ? "-" : ""
  const abs = Math.abs(total)
  const hours = Math.floor(abs)
  const minutes = Math.round((abs - hours) * 60)
  return `${sign}${hours}h ${minutes}m`
}

type Props = {
  data: TimeClockData
}

type DayCardProps = {
  date: string
  dayData: TimeClockData["days"]["data"][string]
}

export function History({ data }: Props) {
  const { database } = useContext(DatabaseContext)
  const [localDays, setLocalDays] = useState<LocalDaysData>({})

  const loadFromDB = useCallback(async () => {
    const user = data?.user
    if (!user) return

    const records = await database.getByIndex<StoredRecord>('records', 'byUser', user)
    const days: LocalDaysData = {}

    for (const record of records) {
      const dayOfWeek = new Date(`${record.date} 12:00:00`).getDay()
      if ([0, 6].includes(dayOfWeek)) continue

      days[record.date] = {
        date: record.date,
        formatted: record.total,
        total: record.time,
        points: record.points ?? [],
      }
    }

    setLocalDays(days)
  }, [database, data?.user])

  const saveData = useCallback(async () => {
    if (!database || !data) return

    const timeframe = data?.days.data
    const user = data.user

    if (!user) return

    for (const key of Object.keys(timeframe)) {
      const result = await database.getByIndex(
        "records",
        "byUserAndDate",
        [user, timeframe[key].date]
      )

      const record = (Array.isArray(result) ? result[0] : result) as StoredRecord | undefined

      if (!record) {
        await database.add("records", {
          date: timeframe[key].date,
          total: timeframe[key]?.formatted,
          time: timeframe[key]?.total ? parseFloat(timeframe[key]?.total.toString()) : timeframe[key]?.total,
          points: timeframe[key]?.points ?? [],
          user,
        })
      } else {
        const dayOfWeek = new Date(`${timeframe[key].date} 12:00:00`).getDay()

        if ([0, 6].includes(dayOfWeek)) continue

        await database.put("records", {
          id: record.id,
          date: record.date,
          time: timeframe[key]?.total ? parseFloat(timeframe[key]?.total.toString()) : timeframe[key]?.total,
          total: timeframe[key]?.formatted,
          points: timeframe[key]?.points ?? [],
          user: record.user,
        })
      }
    }

    await loadFromDB()
  }, [database, data, loadFromDB])

  useEffect(() => {
    queueMicrotask(() => saveData())
  }, [saveData])

  const sortedDays = useMemo(
    () => Object.entries(localDays).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime()),
    [localDays]
  )

  const computedTotal = useMemo(() => {
    if (sortedDays.length === 0) return null

    let total = 0

    for (let i = 1; i < sortedDays.length; i++) {
      let workedTime = sortedDays[i][1].total

      if (workedTime !== null && workedTime !== undefined && !isNaN(Number(workedTime))) {
        if (workedTime > 10) {
          workedTime = 8
        }

        const diff = parseFloat(workedTime.toString()) - 8

        if (!isNaN(diff)) {
          total += diff
        } else {
          total += 8
        }
      }
    }

    return formatTotal(total)
  }, [sortedDays])

  return (
    <div className="p-6 space-y-6">
      <div className="bg-neutral-900 rounded-lg shadow-sm p-6 py-0 min-h-[120px] max-h-[90vh] pb-[50px] overflow-y-auto">
        <div className={computedTotal ? "sticky top-0 z-10 bg-neutral-900" : "hidden"}>
          <div className="flex gap-x-1 mb-1 py-3" data-testid="total-worked">
            <span className="opacity-80">Total:</span>
            <span className="font-bold" style={{ color: computedTotal?.startsWith("-") ? "#da7260" : "#2f9c7b" }}>
              {computedTotal}
            </span>
          </div>
        </div>
        <div className="space-y-3" data-testid="history-list">
          {sortedDays.map(([date, dayData]) => (
            <DayCard key={date} date={date} dayData={dayData} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function DayCard({ date, dayData }: DayCardProps) {
  const dayOfWeek = new Date(`${date} 12:00:00`).getDay()
  const formatDate = () => {
    return new Date(`${date} 12:00:00`).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  }

  return (
    <>
      <div key={date} className="border border-neutral-600/40 rounded-lg py-2 px-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex w-full items-center justify-between">
            <p className="font-medium text-white capitalize opacity-90 text-[14px]">
              {formatDate()} <span className="ml-2 opacity-40">{date}</span>
            </p>
            <p className="text-[13px] text-gray-400/90">{dayData.formatted}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 min-h-[24px]">
          {Array.from({ length: 4 }).map((_, idx) => {
            const point = dayData.points[idx]
            return (
              <span
                key={idx}
                className={`text-xs px-2 py-1 rounded font-mono ${point ? "bg-blue-900/60 text-blue-100/90" : "bg-neutral-700/40 text-neutral-500"}`}>
                {point || "--:--"}
              </span>
            )
          })}
        </div>
      </div>
      {dayOfWeek == 1 && (<hr className="w-full my-4 border-neutral-600/50 border-2 rounded" />)}
    </>
  )
}