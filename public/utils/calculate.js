function differenceInMinutes(d1, d2) {
  const diffMs = Math.abs(d1 - d2)
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  return diffMinutes
}

function calculateWorkedTime(date, points, format = true) {
  const myOffset = '-03:00'

  let timestamps = points?.map(time => `${date}T${time}:00${myOffset}`)
  let hours = 0
  let minutes = 0
  let total = 0

  if (points.length % 2 !== 0) {
    const d = new Date()
    const h = d.toLocaleTimeString('en-GB', { timeZone: 'America/Sao_Paulo', hour: '2-digit' })
    const m = d.toLocaleTimeString('en-GB', { timeZone: 'America/Sao_Paulo', minute: '2-digit' })
    const nowTime = `${h}:${m}`
    const now = `${date}T${nowTime}:00${myOffset}`
    
    if (points.length === 1) {
      total = Math.abs(differenceInMinutes(now, timestamps[0]) / 60)
    } else {
      const difference1 = differenceInMinutes(timestamps[1], timestamps[0]) / 60
      const difference2 = differenceInMinutes(now, timestamps[2]) / 60
      total = difference1 + difference2
    }
    hours = Math.floor(total)
    minutes = Math.round((total - hours) * 60)
  } else if (points.length > 0) {
    if (points.length === 2) {
      const difference = differenceInMinutes(timestamps[1], timestamps[0]) / 60
      total = difference
    } else {
      const difference1 = differenceInMinutes(timestamps[1], timestamps[0]) / 60
      const difference2 = differenceInMinutes(timestamps[3], timestamps[2]) / 60
      total = difference1 + difference2
    }
    hours = Math.floor(total)
    minutes = Math.round((total - hours) * 60)
    minutes = Math.abs(minutes)
    hours = Math.abs(hours)
  }

  if (format) {
    if (isNaN(hours) || isNaN(minutes)) {
      return null
    }

    if (hours.toString().includes("-")) {
      hours = hours.toString().replace("-", "")
    }

    return `${hours}h ${minutes < 10 ? "0" + minutes : minutes}min`
  } else {
    return Math.abs(total).toFixed(2)
  }
}