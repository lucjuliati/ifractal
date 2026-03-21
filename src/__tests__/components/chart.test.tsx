import { render, screen } from "@testing-library/react"
import { Chart } from "@/app/(app)/_components/chart"
import { describe, it, expect, vi } from "vitest"
import { LocalDaysData } from "@/lib/types"

global.ResizeObserver = class ResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

const mockData: LocalDaysData = {
  "2026-03-11": { date: "2026-03-11", formatted: "8h00", total: 8, points: [] },
  "2026-03-12": { date: "2026-03-12", formatted: "6h30", total: 6.5, points: [] },
  "2026-03-13": { date: "2026-03-13", formatted: "9h00", total: 9, points: [] },
}

describe("Chart", () => {
  it("renders the chart container", () => {
    render(<Chart data={mockData} />)
    expect(screen.getByTestId("chart")).toBeInTheDocument()
  })

  it("shows the last 7 days label", () => {
    render(<Chart data={mockData} />)
    expect(screen.getByText("Últimos 7 dias")).toBeInTheDocument()
  })

  it("renders without crashing when data is empty", () => {
    render(<Chart data={{}} />)
    expect(screen.getByTestId("chart")).toBeInTheDocument()
  })
})
