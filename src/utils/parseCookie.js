
export default function parseCookie(cookies) {
  const json = {}
  if (!Array.isArray(cookies) || cookies.length === 0) {
    return json
  }

  cookies.forEach(cookie => {
    const cookiePart = cookie.split(";")[0]

    if (cookiePart) {
      const [name, ...values] = cookiePart.split("=")
      const trimmedName = name.trim()

      if (trimmedName) {
        json[trimmedName] = values.join("=").trim()
      }
    }
  })

  return json
}
