const dialog = document.querySelector("#modal")
const modalContent = document.querySelector("#modal div.modal-content")
const datePicker = document.querySelector("#date-picker")

const previousBtn = document.querySelector("#previous")
const nextBtn = document.querySelector("#next")

async function getReport(e) {
  if (!e.target.value) return

  let date = new Date(`${e.target.value} 12:00:00`)

  if (date.toString() == "Invalid Date") return

  date.setDate(date.getDate() - 1)
  date = date.toISOString().split("T")[0]

  dialog.showModal()
  modalContent.innerHTML = ""

  await fetch(`/report?date=${date}`).then(async (res) => {
    const data = await res.json()

    const itens = [
      data.mcs?.length === 4 ? renderKeyValue("Total", data?.totalWorkedTime) : null,
      renderKeyValue("Data", data.str_data),
      renderBadges("Períodos", data.mcs),
    ].filter(item => item !== null)

    itens.forEach(item => modalContent.appendChild(item))
  })
}

const handleNavigation = (e, direction) => {
  const now = new Date().toISOString().substr(0, 10)

  if (datePicker.value == now && direction == ">") {
    e.preventDefault()
    return
  }

  if (direction == "<") {
    let date = new Date(datePicker.value)
    date.setDate(date.getDate() - 1)
    datePicker.value = date.toISOString().split("T")[0]
  } else {

    let date = new Date(datePicker.value)
    date.setDate(date.getDate() + 1)
    datePicker.value = date.toISOString().split("T")[0]
  }

  datePicker.dispatchEvent(new Event("change", { bubbles: true }))
}

try {
  const max = new Date().toISOString().split("T")[0]

  datePicker.setAttribute("max", max)
  datePicker.addEventListener("change", getReport)
} catch (err) {
  console.error(err)
}

previousBtn.addEventListener("click", (e) => handleNavigation(e, "<"))
nextBtn.addEventListener("click", (e) => handleNavigation(e, ">"))