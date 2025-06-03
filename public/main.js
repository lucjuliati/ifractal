const dataContainer = document.querySelector("#data-container")

function decimalToTime(decimal) {
  const hours = Math.floor(decimal)
  const minutes = Math.round((decimal - hours) * 60)
  return `${hours}h ${minutes < 10 ? "0" + minutes : minutes}min`
}

function renderData(serverData) {
  try {
    console.log(serverData.dados)

    const data = serverData.dados
    const lastUpdated = new Date().toLocaleString()

    const itens = [
      renderKeyValue("Status", data.situ_dia),
      renderKeyValue("Total", data.tot_trabalhado?.replace("+", "")),
      renderKeyValue("Previsto", `${data.previsto}h`),
      renderKeyValue("Faltam", decimalToTime(data.previsto - data.trabalhado)),
      renderProgress("Progresso", data.perct_trabalhado, data?.trabalhado, data?.previsto),
      renderBadges("Períodos", data.mcs),
      renderDate("Atualizado em", lastUpdated)
    ]

    itens.forEach(item => dataContainer.appendChild(item))
  } catch (err) {
    console.error(err)
  }
}