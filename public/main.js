const dataContainer = document.querySelector("#data-container")

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

function renderData(serverData) {
  try {
    dataContainer.innerHTML = ""
    console.log(serverData.dados)

    const data = serverData.dados
    const lastUpdated = new Date().toLocaleString()
    let timeLeft = data.previsto - data.trabalhado

    if (timeLeft < 0) timeLeft = 0

    const itens = [
      renderKeyValue("Total", data.tot_trabalhado?.replace("+", "")),
      renderKeyValue("Previsto", `${data.previsto}h`),
      renderKeyValue("Faltam", decimalToTime(timeLeft)),
      (data.mcs?.length >= 3) ? renderKeyValue("Previsão", addDecimalTimeToDate(new Date(), timeLeft)) : null,
      renderProgress("Progresso", data.perct_trabalhado, data?.trabalhado, data?.previsto),
      renderBadges("Períodos", data.mcs),
      renderDate("Atualizado em", lastUpdated)
    ].filter(item => item !== null)

    itens.forEach(item => dataContainer.appendChild(item))
  } catch (err) {
    console.error(err)
  }
}

function getData() {
  setInterval(() => {
    fetch("/data")
      .then(res => res.json())
      .then(async ({ data }) => renderData(data))
      .catch(console.error)
  }, 60_000)
}

getData()