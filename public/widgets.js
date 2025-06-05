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

function renderDate(k, date) {
  const container = document.createElement("div")
  container.setAttribute("class", "last-updated")
  container.append(renderKeyValue(k, date))
  return container
}
