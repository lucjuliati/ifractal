import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/utils/session", () => ({
  getToken: vi.fn().mockResolvedValue({ user: "testuser", token: "mock-token" }),
}))

vi.mock("@/lib/utils/config", () => ({
  baseUrl: "http://mock-server",
}))

vi.mock("@/lib/utils/cache", () => {
  const store = new Map()
  return {
    TTLCache: {
      getInstance: () => ({
        get: (k: string) => store.get(k),
        set: (k: string, v: unknown) => store.set(k, v),
        clear: () => store.clear(),
      }),
    },
  }
})

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}))

vi.mock("@/lib/actions/calculate-worked-time", () => ({
  calculateWorkedTime: vi.fn().mockReturnValue(8),
  format: vi.fn().mockReturnValue("8h 00min"),
}))

import { handleInterval } from "@/lib/actions/handle-interval"
import { TTLCache } from "@/lib/utils/cache"

describe("handleInterval", () => {
  beforeEach(() => {
    (TTLCache.getInstance()).clear()
    vi.clearAllMocks()
  })

  it("returns data with total and interval object", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      text: async () => JSON.stringify({ ponto_resumo_dia: { mcs: ["08:00", "17:00"] } }),
    }) as unknown as typeof fetch

    const result = await handleInterval({ days: 7 })
    expect(result).toHaveProperty("total")
    expect(result).toHaveProperty("data")
  })

  it("returns cached data on second call", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      text: async () => JSON.stringify({ ponto_resumo_dia: { mcs: ["08:00", "17:00"] } }),
    }) as unknown as typeof fetch

    const first = await handleInterval({ days: 7 })
    const second = await handleInterval({ days: 7 })
    expect(second).toEqual(first)
  })

  it("clamps days to minimum of 7", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      text: async () => JSON.stringify({ ponto_resumo_dia: { mcs: [] } }),
    }) as unknown as typeof fetch

    const result = await handleInterval({ days: 3 })
    expect(result).toHaveProperty("data")
    const keys = Object.keys((result as { data: string[] }).data)
    expect(keys.length).toBeLessThanOrEqual(7)
  })

  it("clamps days to maximum of 30", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      text: async () => JSON.stringify({ ponto_resumo_dia: { mcs: [] } }),
    }) as unknown as typeof fetch

    const result = await handleInterval({ days: 50 })
    expect(result).toHaveProperty("data")
    const keys = Object.keys((result as { data: string[] }).data)
    expect(keys.length).toBeLessThanOrEqual(30)
  })

  it("returns null when getToken throws", async () => {
    const { getToken } = await import("@/lib/utils/session")
    vi.mocked(getToken).mockRejectedValueOnce(new Error("fail"))

    const result = await handleInterval({})
    expect(result).toBeNull()
  })
})
