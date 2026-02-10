function renderKeyValue(k, v) {
  const container = document.createElement("p")
  const key = document.createElement("strong")
  const value = document.createElement("span")

  key.textContent = `${k}: `
  value.textContent = v

  container.appendChild(key)
  container.appendChild(value)
  return container
}

function renderBadges(k, itens) {
  const container = document.createElement("div")
  const badges = document.createElement("div")
  const key = document.createElement("div")
  key.setAttribute("style", "font-weight: bold; opacity: 0.75;")
  key.textContent = `${k}:`

  badges.setAttribute("id", "grid")
  container.appendChild(key)

  for (let i = 0; i < 4; i++) {
    const badge = document.createElement("div")
    let item = itens[i]

    if (item) {
      badge.setAttribute("class", "badge")
      badge.innerHTML = item
    } else {
      badge.setAttribute("class", "badge-empty")
    }

    badges.appendChild(badge)
  }

  container.appendChild(badges)
  return container
}

function renderProgress(k, percentage, current, max) {
  const container = document.createElement("div")
  const progress = document.createElement("progress")
  progress.setAttribute("value", current)
  progress.setAttribute("max", max)

  container.setAttribute("style", "margin-top: 2px;")
  container.appendChild(renderKeyValue(k, `${percentage}%`))
  container.appendChild(progress)

  return container
}

function lunchBreakSelect(k, value, onChange) {
  const container = document.createElement("select")
  const label = document.createElement("label")

  for (let i = 1; i <= 2; i++) {
    const option = document.createElement("option")
    option.setAttribute("value", i)
    option.textContent = i == 1 ? `${i} Hora` : `${i} Horas`
    container.appendChild(option)
  }

  container.value = value ?? 1
  container.setAttribute("id", "lunch-break")
  container.addEventListener("change", onChange)
  container.style.marginLeft = "10px"
  label.setAttribute("style", "font-weight: bold; color: #d2d2d2;")
  label.textContent = k
  label.appendChild(container)
  return label
}

function renderDate(k, date) {
  const container = document.createElement("div")
  container.setAttribute("class", "last-updated")
  container.append(renderKeyValue(k, date))
  return container
}

function decimalToTime(decimal) {
  const hours = Math.floor(decimal)
  const minutes = Math.round((decimal - hours) * 60)

  return `${hours}h ${minutes < 10 ? "0" + minutes : minutes}min`
}

function addDecimalTimeToDate(originalDate, decimal) {
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

  return `${hrs}:${mins < 10 ? "0" + mins : mins}`
}

async function renderWorkWeek(db, user) {
  try {
    const { records, total } = await getRecords(db, user)

    const container = document.querySelector("#last-week")
    container.innerHTML = ""

    const table = document.createElement("table")
    const thead = document.createElement("thead")
    const tbody = document.createElement("tbody")
    const totalSpan = document.createElement("span")

    thead.innerHTML = `
      <tr>
        <th>Dia</th>
        <th>Data</th>
        <th>Total</th>
      </tr>
    `

    table.appendChild(thead)

    records?.forEach((record) => {
      const tr = document.createElement("tr")

      const date = new Date(`${record?.date} 12:00:00`)
      const dayOfWeek = date.getDay()
      const formatted = date.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long"
      })

      const part1 = formatted.split(",")[0]
      const part2 = formatted.split(",")[1]
      let total = record?.total ?? "---"

      if (record.time == 0 || record?.points?.length == 0) {
        total = "---"
      }

      if (dayOfWeek == 1) {
        console.log("this", formatted)
        tr.style.borderTop = "1px solid #cacaca"
      }

      tr.innerHTML = `
        <td>${part1}</td>
        <td>${part2}</td>
        <td>${total}</td>
      `
      tbody.appendChild(tr)
    })

    table.appendChild(tbody)
    container.appendChild(table)

    totalSpan.style.color = total.startsWith("-") ? "rgb(255, 121, 98)" : "#3ac363ff"
    totalSpan.textContent = `Total: ${total}`
    container.appendChild(totalSpan)
  } catch (err) {
    console.error(err)
  }
}

async function getRecords(db, user) {
  try {
    let total = 0

    const records = await db.getByIndex(
      'records',
      'byUser',
      user
    )

    for (let i = 0; i < records.length; i++) {
      if (i > 0 && !isNaN(records[i]?.time)) {
        if (records[i]?.time == 0) continue

        if (!isNaN((parseFloat(records[i]?.time) - 8))) {
          total += (parseFloat(records[i]?.time) - 8)
        } else {
          total += 8
        }
      }
    }

    const sign = total < 0 ? "-" : ""
    const abs = Math.abs(total)

    const hours = Math.floor(abs)
    const minutes = Math.round((abs - hours) * 60)

    records.sort((a, b) => new Date(b.date) - new Date(a.date))

    return { records, total: `${sign}${hours}h ${minutes}m` }
  } catch (err) {
    console.error(err)
  }
}

async function saveToDB(db, data, user) {
  if (!data) return

  const timeframe = data?.data

  for (const key of Object.keys(timeframe)) {
    const result = await db.getByIndex(
      'records',
      'byUserAndDate',
      [user, timeframe[key].date]
    )

    const record = Array.isArray(result) ? result[0] : result

    if (!record) {
      await db.add('records', {
        date: timeframe[key].date,
        total: timeframe[key]?.formatted,
        time: timeframe[key]?.total ? parseFloat(timeframe[key]?.total) : timeframe[key]?.total,
        points: timeframe[key]?.points ?? [],
        user,
      })
    } else {
      const dayOfWeek = new Date(`${timeframe[key].date} 12:00:00`).getDay()

      if ([0, 6].includes(dayOfWeek)) continue

      await db.put('records', {
        id: record.id,
        date: record.date,
        time: record.time,
        total: timeframe[key]?.formatted,
        points: timeframe[key]?.points ?? [],
        user: record.user,
      })
    }
  }
}