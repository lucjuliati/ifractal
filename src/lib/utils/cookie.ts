export function parseCookie(cookies: string[] | undefined) {
  const cookie: { [key: string]: string } = {}

  if (!Array.isArray(cookies) || cookies.length === 0) {
    return cookie
  }

  cookies.forEach(part => {
    const cookiePart = part.split(";")[0]

    if (cookiePart) {
      const [name, ...values] = cookiePart.split("=")
      const trimmedName: string = name.trim()

      if (trimmedName) {
        cookie[trimmedName] = values.join("=").trim()
      }
    }
  })

  return cookie
}
