import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { TTLCache } from "@/lib/utils/cache"

describe("TTLCache", () => {
  let cache: TTLCache<string, string>

  beforeEach(() => {
    vi.useFakeTimers()
    cache = new TTLCache<string, string>()
  })

  afterEach(() => {
    cache.destroy()
    vi.useRealTimers()
  })

  it("stores and retrieves a value", () => {
    cache.set("key", "value", 10_000)
    expect(cache.get("key")).toBe("value")
  })

  it("returns undefined for missing key", () => {
    expect(cache.get("nope")).toBeUndefined()
  })

  it("expires entries after TTL", () => {
    cache.set("key", "value", 5_000)
    vi.advanceTimersByTime(5_001)
    expect(cache.get("key")).toBeUndefined()
  })

  it("has() returns true for live entries", () => {
    cache.set("key", "value", 10_000)
    expect(cache.has("key")).toBe(true)
  })

  it("has() returns false for expired entries", () => {
    cache.set("key", "value", 1_000)
    vi.advanceTimersByTime(1_001)
    expect(cache.has("key")).toBe(false)
  })

  it("delete() removes an entry", () => {
    cache.set("key", "value", 10_000)
    expect(cache.delete("key")).toBe(true)
    expect(cache.get("key")).toBeUndefined()
  })

  it("clear() removes all entries", () => {
    cache.set("a", "1", 10_000)
    cache.set("b", "2", 10_000)
    cache.clear()
    expect(cache.size).toBe(0)
  })

  it("size reflects current entry count", () => {
    cache.set("a", "1", 10_000)
    cache.set("b", "2", 10_000)
    expect(cache.size).toBe(2)
  })

  it("cleanup() removes expired entries", () => {
    cache.set("live", "yes", 60_000)
    cache.set("dead", "no", 1_000)
    vi.advanceTimersByTime(2_000)
    cache.cleanup()
    expect(cache.get("live")).toBe("yes")
    expect(cache.get("dead")).toBeUndefined()
    expect(cache.size).toBe(1)
  })

  it("getInstance returns a singleton", () => {
    const a = TTLCache.getInstance()
    const b = TTLCache.getInstance()
    expect(a).toBe(b)
  })
})
