const dataContainer = document.querySelector("#data-container")
let lastFetched = 0

function fetchData() {
  lastFetched = new Date().getTime()

  fetch("/data")
    .then(res => res.json())
    .then(async ({ data }) => renderData(data))
    .catch(console.error)
}

function handleLunchBreak(e) {
  localStorage.setItem("lunch-break", e.target.value)
  fetchData()
}

function renderData(serverData) {
  try {
    dataContainer.innerHTML = ""

    const data = serverData.dados
    const lastUpdated = new Date().toLocaleString()
    let lunchBreakValue = localStorage.getItem("lunch-break")
    let timeLeft = data.previsto - data.trabalhado

    if (timeLeft < 0) timeLeft = 0

    if (data.mcs?.length <= 2) {
      if (lunchBreakValue && (isNaN(lunchBreakValue) == false)) {
        timeLeft += Number(lunchBreakValue)
      }
    }

    const itens = [
      renderKeyValue("Total", data.tot_trabalhado?.replace("+", "")),
      renderKeyValue("Previsto", `${data.previsto}h`),
      renderKeyValue("Faltam", decimalToTime(timeLeft)),
      renderKeyValue("Previsão", addDecimalTimeToDate(new Date(), timeLeft)),
      (data.mcs?.length <= 2) ? lunchBreakSelect("Horas de almoço", lunchBreakValue, handleLunchBreak) : null,
      renderProgress("Progresso", data.perct_trabalhado, data?.trabalhado, data?.previsto),
      renderBadges("Períodos", data.mcs),
      renderDate("Atualizado em", lastUpdated)
    ].filter(item => item !== null)

    renderWorkWeek(serverData.workWeek)

    itens.forEach(item => dataContainer.appendChild(item))
  } catch (err) {
    console.error(err)
  }
}

function getData() {
  setInterval(() => {
    if (!document.hidden) fetchData()
  }, 60_000)
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && new Date().getTime() - lastFetched > 30_000) {
    fetchData()
  }
})

getData()