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

  const MS_PER_SECOND = 1000
  const SECONDS_PER_MINUTE = 60
  const MINUTES_PER_HOUR = 60

  const newDate = new Date(originalDate.getTime())

  const hoursInMs = hours * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND
  const minutesInMs = minutes * SECONDS_PER_MINUTE * MS_PER_SECOND

  newDate.setTime(newDate.getTime() + (hoursInMs + minutesInMs))

  const hrs = newDate.getHours()
  const mins = newDate.getMinutes()

  return `${hrs}:${mins < 10 ? "0" + mins : mins}`
}

function renderWorkWeek(week) {
  try {
    const container = document.querySelector("#work-week")
    const table = document.createElement("table")
    const thead = document.createElement("thead")
    const tbody = document.createElement("tbody")
    const total = document.createElement("span")

    thead.innerHTML = `
      <tr>
        <th>Dia</th>
        <th>Data</th>
        <th>Total</th>
      </tr>
    `

    table.appendChild(thead)

    if (week?.data) {
      Object.keys(week.data).forEach(key => {
        const tr = document.createElement("tr")
        tr.setAttribute("style", "opacity: 0.75;")

        const date = new Date(`${key} 12:00:00`).toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "numeric",
          month: "long"
        })

        const part1 = date.split(",")[0]
        const part2 = date.split(",")[1]

        tr.innerHTML = `
          <td>${part1}</td>
          <td>${part2}</td>
          <td>${week.data[key]?.formatted ?? "---"}</td>
        `

        tbody.appendChild(tr)
      })

      table.appendChild(tbody)
      container.appendChild(table)

      total.style.marginTop = "4px"
      total.style.textAlign = "center"
      total.style.color = week.total.startsWith("-") ? "#e16049ff" : "#23774aff"
      total.textContent = `Total: ${week.total}`
      container.appendChild(total)
    }
  } catch (err) {
    console.error(err)
  }
}