export function getToken(req) {
  try {
    const split = req.cookies.session.split(":")
    const token = split[0]
    const user = split[1]

    return { token, user }
  } catch (err) {
    throw err
  }
}