import { render, screen } from "@testing-library/react"
import { TimeClock } from "@/app/(app)/_components/time-clock"
import { describe, it, expect, vi } from "vitest"
import { TimeClockData } from "@/lib/types"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}))

const mockData: TimeClockData = {
  user: "testuser",
  dados: {
    perct_trabalhado: 75,
    previsto: 8,
    tot_trabalhado: "6h00",
    data: "2024-03-13",
    trabalhado: 6,
    str_data: "Quarta-feira, 13 de março",
    mcs: ["08:00", "12:00", "13:00", "17:00"],
  },
  days: { total: "+0h30", data: {} },
}

describe("TimeClock", () => {
  it("renders the date string", () => {
    render(<TimeClock data={mockData} />)
    expect(screen.getByText("Quarta-feira, 13 de março")).toBeInTheDocument()
  })

  it("shows worked time", () => {
    render(<TimeClock data={mockData} />)
    expect(screen.getByTestId("worked-time")).toHaveTextContent("6h00")
  })

  it("shows worked percentage", () => {
    render(<TimeClock data={mockData} />)
    expect(screen.getByTestId("worked-percentage")).toHaveTextContent("75%")
  })

  it("renders progress bar with segmented work and lunch", () => {
    render(<TimeClock data={mockData} />)
    const progress = screen.getByTestId("progress")
    const blueSegments = progress.querySelectorAll(".bg-blue-500") as NodeListOf<HTMLElement>
    const lunchSegment = progress.querySelector(".bg-amber-500") as HTMLElement

    expect(blueSegments.length).toBe(2)
    expect(lunchSegment).not.toBeNull()
    expect(parseFloat(lunchSegment.style.width)).toBeGreaterThan(0)
  })

  it("caps total progress bar segments at 100%", () => {
    const overData = { ...mockData, dados: { ...mockData.dados, perct_trabalhado: 120, trabalhado: 9.6 } }
    render(<TimeClock data={overData} />)
    const progress = screen.getByTestId("progress")
    const segments = progress.querySelectorAll(".tooltip-container") as NodeListOf<HTMLElement>
    const totalWidth = Array.from(segments).reduce(
      (sum, el) => sum + parseFloat(el.style.width), 0
    )
    expect(totalWidth).toBeCloseTo(100, 0)
  })

  it("renders all time points", () => {
    render(<TimeClock data={mockData} />)
    const points = screen.getByTestId("points")
    mockData.dados.mcs.forEach((t) => {
      expect(points).toHaveTextContent(t)
    })
  })

  it("renders the register button", () => {
    render(<TimeClock data={mockData} />)
    expect(screen.getByTestId("register-btn")).toBeInTheDocument()
  })
})
