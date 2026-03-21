import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}))

vi.mock("@/lib/utils/config", () => ({
  isSecure: false,
}))

import { createToken, getToken, deleteToken } from "@/lib/utils/session"
import { cookies } from "next/headers"

const cookiesMock = {
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
  has: vi.fn(),
  getAll: vi.fn(),
  toString: vi.fn(),
  [Symbol.iterator]: vi.fn(),
} as unknown as Awaited<ReturnType<typeof cookies>>

describe("session", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(cookies).mockResolvedValue(cookiesMock)
  })

  describe("createToken", () => {
    it("sets the s_token cookie with correct options", async () => {
      await createToken("mytoken:myuser")
      expect(cookiesMock.set).toHaveBeenCalledWith(
        "s_token",
        "mytoken:myuser",
        expect.objectContaining({ httpOnly: true, secure: false })
      )
    })
  })

  describe("getToken", () => {
    it("returns token and user when cookie exists", async () => {
      cookiesMock.get = vi.fn().mockReturnValue({ value: "tok123:john" })
      const result = await getToken()
      expect(result).toEqual({ token: "tok123", user: "john" })
    })

    it("returns nulls when cookie is missing", async () => {
      cookiesMock.get = vi.fn().mockReturnValue(undefined)
      const result = await getToken()
      expect(result).toEqual({ token: null, user: null })
    })
  })

  describe("deleteToken", () => {
    it("deletes the s_token cookie", async () => {
      await deleteToken()
      expect(cookiesMock.delete).toHaveBeenCalledWith("s_token")
    })
  })
})
