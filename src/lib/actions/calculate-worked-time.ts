import { differenceInMinutes } from "date-fns"

const myOffset = '-03:00'

export function calculateWorkedTime(date: string, points: string[]): number | null {
  if (points.length === 0) {
    return null
  }

  const timestamps = points.map(time => new Date(`${date}T${time}:00${myOffset}`))

  let total = 0

  for (let i = 0; i + 1 < timestamps.length; i += 2) {
    total += differenceInMinutes(timestamps[i + 1], timestamps[i]) / 60
  }

  if (points.length % 2 !== 0) {
    total += differenceInMinutes(new Date(), timestamps[timestamps.length - 1]) / 60
  }

  return Number(Math.abs(total).toFixed(2))
}


export function decimalToTime(decimal: number) {
  const hours = Math.floor(decimal)
  const minutes = Math.round((decimal - hours) * 60)

  if (hours.toString() === "NaN" || minutes.toString() === "NaN") {
    return "---"
  }

  return `${hours}h ${minutes < 10 ? "0" + minutes : minutes}min`
}

export function format(date: string, points: string[]) {
  const calc = calculateWorkedTime(date, points)

  if (!calc || isNaN(calc)) {
    return "---"
  }

  return decimalToTime(calc)
}
