import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

vi.mock("@/lib/utils/session", () => ({
  getToken: vi.fn(),
}))

import { withMiddleware } from "@/lib/middleware"
import { cookies } from "next/headers"
import { getToken } from "@/lib/utils/session"
import { NextRequest } from "next/server"

const cookiesMock = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  has: vi.fn(),
  getAll: vi.fn(),
  toString: vi.fn(),
  [Symbol.iterator]: vi.fn(),
} as unknown as Awaited<ReturnType<typeof cookies>>

function makeRequest(url = "http://localhost/api/test") {
  return new NextRequest(new URL(url))
}

describe("withMiddleware", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(cookies).mockResolvedValue(cookiesMock)
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  it("returns 401 redirect when session cookie is missing", async () => {
    cookiesMock.get = vi.fn().mockReturnValue(undefined)

    const handler = vi.fn()
    const wrapped = withMiddleware(handler)
    const res = await wrapped(makeRequest() as NextRequest)

    expect(handler).not.toHaveBeenCalled()
    expect(res.status).toBe(307)
  })

  it("returns 401 redirect when user is null", async () => {
    cookiesMock.get = vi.fn().mockReturnValue({ value: "session" })
    vi.mocked(getToken).mockResolvedValue({ user: null, token: null })

    const handler = vi.fn()
    const wrapped = withMiddleware(handler)
    const res = await wrapped(makeRequest() as NextRequest)

    expect(handler).not.toHaveBeenCalled()
    expect(res.status).toBe(307)
  })

  it("calls handler and attaches user when authenticated", async () => {
    cookiesMock.get = vi.fn().mockReturnValue({ value: "session" })
    vi.mocked(getToken).mockResolvedValue({ user: "john", token: "tok" })

    const handler = vi.fn().mockResolvedValue(new Response("ok"))
    const wrapped = withMiddleware(handler)
    const req = makeRequest() as NextRequest & { user?: string }

    await wrapped(req)

    expect(handler).toHaveBeenCalled()
    expect(req.user).toBe("john")
  })
})
