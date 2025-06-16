const form = document.querySelector("form")
const modal = document.querySelector("#modal")
const modalContent = document.querySelector("#modal-content")

form.onsubmit = function (e) {
  e.preventDefault()

  const email = form?.[0]?.value ?? ""
  const password = form?.[1]?.value ?? ""

  if (email && password) {
    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    }).then(async function (res) {
      const data = await res.json()

      if (res.status == 200) {
        window.location.reload()
      } else {
        modal.showModal()
        modalContent.textContent = data?.error
        setTimeout(() => closeModal(), 5000)
      }
    })
  }
}

function closeModal() {
  modalContent.textContent = ""
  modal.close()
}