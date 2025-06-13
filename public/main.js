const dataContainer = document.querySelector("#data-container")
let lastFetched = 0

function fetchData() {
  lastFetched = new Date().getTime()
  
  fetch("/data")
    .then(res => res.json())
    .then(async ({ data }) => renderData(data))
    .catch(console.error)
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
    if (!document.hidden) fetchData()
  }, 60_000)
}

document.addEventListener("visibilitychange",() =>{
  if (!document.hidden && new Date().getTime() - lastFetched > 30_000) {
    fetchData()
  }
})

getData()