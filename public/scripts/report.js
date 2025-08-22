const dialog = document.querySelector("#modal")
const modalContent = document.querySelector("#modal div.modal-content")
const datePicker = document.querySelector("#date-picker")

async function getReport(e) {
  if (!e.target.value) return

  let date = new Date(`${e.target.value} 12:00:00`)
  
  if (date.toString() == "Invalid Date") return

  date.setDate(date.getDate() - 1)
  date = date.toISOString().split("T")[0]

  dialog.showModal()

  await fetch(`/report?date=${date}`).then(async (res) => {
    const data = await res.json()
    
    const itens = [
      renderKeyValue("Total", data?.totalWorkedTime),
      renderKeyValue("Data", data.str_data),
      renderBadges("Períodos", data.mcs),
    ].filter(item => item !== null)

    itens.forEach(item => modalContent.appendChild(item))
  })
}

try {
  let max = new Date().setDate(new Date().getDate() - 1)
  max = new Date(max).toISOString().split("T")[0]

  datePicker.setAttribute("max", max)
  datePicker.addEventListener("change", getReport)

} catch (err) {
  console.error(err)
}