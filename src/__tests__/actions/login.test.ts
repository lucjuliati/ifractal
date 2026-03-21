import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ set: vi.fn() }),
}))

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}))

vi.mock("@/lib/utils/config", () => ({
  baseUrl: "http://mock-server",
  isSecure: false,
}))

vi.mock("@/lib/utils/cookie", () => ({
  parseCookie: vi.fn(() => ({ STOU_Sistemas: "mock-session-token" })),
}))

import { loginAction } from "@/lib/actions/login"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const cookiesMock = {
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
  has: vi.fn(),
  getAll: vi.fn(),
  toString: vi.fn(),
  [Symbol.iterator]: vi.fn(),
} as unknown as Awaited<ReturnType<typeof cookies>>

function makeFormData(login: string, password: string) {
  const fd = new FormData()
  fd.append("login", login)
  fd.append("password", password)
  return fd
}

describe("loginAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(cookies).mockResolvedValue(cookiesMock)
  })

  it("returns error when login is missing", async () => {
    const fd = new FormData()
    fd.append("password", "pass")
    const result = await loginAction(null, fd)
    expect(result).toEqual({ error: "Usuário ou senha inválidos" })
  })

  it("returns error when password is missing", async () => {
    const fd = new FormData()
    fd.append("login", "user")
    const result = await loginAction(null, fd)
    expect(result).toEqual({ error: "Usuário ou senha inválidos" })
  })

  it("returns error when server returns success: false", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      text: async () => JSON.stringify({ success: false }),
      headers: { getSetCookie: () => [] },
    }) as unknown as typeof fetch

    const result = await loginAction(null, makeFormData("user", "wrong"))
    expect(result).toEqual({ error: "Invalid credentials" })
  })

  it("sets cookie and redirects on successful login", async () => {
    const mockSet = vi.fn()
    cookiesMock.set = mockSet

    vi.mocked(cookies).mockResolvedValue(cookiesMock)

    global.fetch = vi.fn().mockResolvedValue({
      text: async () => JSON.stringify({ success: true }),
      headers: { getSetCookie: () => ["STOU_Sistemas=mock-session-token"] },
    }) as unknown as typeof fetch

    await loginAction(null, makeFormData("user", "correct"))

    expect(mockSet).toHaveBeenCalledWith(
      "s_token",
      "mock-session-token:user",
      expect.objectContaining({ httpOnly: true })
    )
    expect(vi.mocked(redirect)).toHaveBeenCalledWith("/")
  })

  it("returns error when fetch throws", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error")) as unknown as typeof fetch
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { })

    const result = await loginAction(null, makeFormData("user", "pass"))
    expect(result).toEqual({ error: "Usuário ou senha inválidos" })

    consoleSpy.mockRestore()
  })
})
