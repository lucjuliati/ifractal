import { describe, it, expect } from "vitest"
import { calculateWorkedTime, decimalToTime, format } from "@/lib/actions/calculate-worked-time"

describe("calculateWorkedTime", () => {
  it("returns null for empty points", () => {
    expect(calculateWorkedTime("2024-03-13", [])).toBeNull()
  })

  it("calculates a full day with 4 points (2 intervals)", () => {
    // 08:00–12:00 = 4h, 13:00–17:00 = 4h → 8h
    const result = calculateWorkedTime("2024-03-13", ["08:00", "12:00", "13:00", "17:00"])
    expect(result).toBe(8)
  })

  it("calculates a single complete interval", () => {
    // 09:00–11:30 = 2.5h
    const result = calculateWorkedTime("2024-03-13", ["09:00", "11:30"])
    expect(result).toBe(2.5)
  })

  it("handles odd number of points (open interval uses current time)", () => {
    // With 1 point the clock is still running — result should be > 0
    const result = calculateWorkedTime("2024-03-13", ["08:00"])
    expect(result).not.toBeNull()
    expect(result).toBeGreaterThan(0)
  })

  it("returns a non-negative number", () => {
    const result = calculateWorkedTime("2024-03-13", ["08:00", "17:00"])
    expect(result).toBeGreaterThanOrEqual(0)
  })

  it("rounds to 2 decimal places", () => {
    const result = calculateWorkedTime("2024-03-13", ["08:00", "09:10"])
    // 70 minutes = 1.1666... → 1.17
    expect(result).toBe(1.17)
  })
})

describe("decimalToTime", () => {
  it("converts whole hours", () => {
    expect(decimalToTime(8)).toBe("8h 00min")
  })

  it("converts hours and minutes", () => {
    expect(decimalToTime(8.5)).toBe("8h 30min")
  })

  it("pads single-digit minutes with leading zero", () => {
    expect(decimalToTime(1.1)).toBe("1h 06min")
  })

  it("returns '---' for NaN input", () => {
    expect(decimalToTime(NaN)).toBe("---")
  })
})

describe("format", () => {
  it("returns '---' for empty points", () => {
    expect(format("2024-03-13", [])).toBe("---")
  })

  it("returns formatted string for valid points", () => {
    const result = format("2024-03-13", ["08:00", "12:00", "13:00", "17:00"])
    expect(result).toBe("8h 00min")
  })
})
