import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next/navigation", () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ get: vi.fn() }),
}))

vi.mock("@/lib/utils/session", () => ({
  getToken: vi.fn().mockResolvedValue({ user: "testuser", token: "mock-token" }),
}))

vi.mock("@/lib/utils/config", () => ({ baseUrl: "http://mock-server" }))

vi.mock("@/lib/actions/handle-interval", () => ({
  handleInterval: vi.fn().mockResolvedValue({ total: "+0h00", data: {} }),
}))

import { getData } from "@/lib/actions/get-data"
import { cookies } from "next/headers"

const cookiesMock = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  has: vi.fn(),
  getAll: vi.fn(),
  toString: vi.fn(),
  [Symbol.iterator]: vi.fn(),
} as unknown as Awaited<ReturnType<typeof cookies>>

describe("getData", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("throws 'Unauthorized' when session cookie is missing", async () => {
    cookiesMock.get = vi.fn().mockReturnValue(undefined)

    await expect(getData()).rejects.toThrow("Unauthorized")
  })

  it("rejects with 401 when response contains HTML (session expired)", async () => {
    cookiesMock.get = vi.fn().mockReturnValue({ value: "valid-session" })

    vi.mocked(cookies).mockResolvedValue(cookiesMock)

    global.fetch = vi.fn().mockResolvedValue({
      text: async () => "<html>Session expired</html>",
    }) as unknown as typeof fetch

    await expect(getData()).rejects.toMatchObject({ status: 401 })
  })

  it("resolves with stringified data on success", async () => {
    cookiesMock.get = vi.fn().mockReturnValue({ value: "valid-session" })

    vi.mocked(cookies).mockResolvedValue(cookiesMock)

    const mockPayload = {
      colab: { centro1: { name: "Test User", id: 1 } },
    }

    global.fetch = vi.fn().mockResolvedValue({
      text: async () => JSON.stringify(mockPayload),
    }) as unknown as typeof fetch

    const result = await getData({ days: 7 })
    expect(result).toBeDefined()

    const parsed = JSON.parse(result!)
    expect(parsed.name).toBe("Test User")
    expect(parsed.user).toBe("testuser")
    expect(parsed.days).toBeDefined()
  })
})
