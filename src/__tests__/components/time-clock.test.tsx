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

  it("renders progress bar with correct width", () => {
    render(<TimeClock data={mockData} />)
    const progress = screen.getByTestId("progress")
    const bar = progress.querySelector(".bg-blue-500") as HTMLElement
    expect(bar.style.width).toBe("75%")
  })

  it("caps progress bar at 100% when percentage exceeds 100", () => {
    const overData = { ...mockData, dados: { ...mockData.dados, perct_trabalhado: 120 } }
    render(<TimeClock data={overData} />)
    const bar = screen.getByTestId("progress").querySelector(".bg-blue-500") as HTMLElement
    expect(bar.style.width).toBe("100%")
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
