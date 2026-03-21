import { describe, it, expect } from "vitest"
import { parseCookie } from "@/lib/utils/cookie"

describe("parseCookie", () => {
  it("returns empty object for undefined input", () => {
    expect(parseCookie(undefined)).toEqual({})
  })

  it("returns empty object for empty array", () => {
    expect(parseCookie([])).toEqual({})
  })

  it("parses a single cookie", () => {
    expect(parseCookie(["session=abc123"])).toEqual({ session: "abc123" })
  })

  it("parses multiple cookies", () => {
    const result = parseCookie(["a=1; Path=/", "b=2; HttpOnly"])
    expect(result).toEqual({ a: "1", b: "2" })
  })

  it("handles cookie values containing '='", () => {
    const result = parseCookie(["token=abc=def=ghi"])
    expect(result).toEqual({ token: "abc=def=ghi" })
  })

  it("trims whitespace from cookie names", () => {
    const result = parseCookie(["  name  =value"])
    expect(result).toEqual({ name: "value" })
  })

  it("ignores entries with empty name after trim", () => {
    const result = parseCookie(["=value"])
    expect(result).toEqual({})
  })
})
