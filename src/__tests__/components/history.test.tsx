import React from "react"
import { describe, it, expect, vi } from "vitest"
import { act, render, screen } from "@testing-library/react"
import { History, DayCard } from "@/app/(app)/_components/history"
import { DatabaseContext } from "@/lib/context/database"
import { TimeClockData } from "@/lib/types"

vi.mock("@/app/context/database", () => {
  const DatabaseContext = React.createContext<{ db: unknown }>({ db: null })
  return { DatabaseContext }
})

const mockDb = {
  getByIndex: vi.fn().mockResolvedValue([]),
  add: vi.fn().mockResolvedValue(undefined),
  put: vi.fn().mockResolvedValue(undefined),
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <DatabaseContext.Provider value={{ database: mockDb as never }}>
    {children}
  </DatabaseContext.Provider>
)

const mockData: TimeClockData = {
  user: "testuser",
  dados: {
    perct_trabalhado: 100,
    tot_trabalhado: "8h00",
    previsto: 8,
    data: "2026-03-13",
    trabalhado: 8,
    str_data: "Quarta-feira, 13 de março",
    mcs: ["08:00", "17:00"],
  },
  days: {
    total: "+0h00",
    data: {
      "2026-03-11": { date: "2026-03-11", formatted: "8h00", total: 8, points: ["08:00", "17:00"] },
      "2026-03-12": { date: "2026-03-12", formatted: "6h30", total: 6.5, points: ["09:00", "15:30"] },
    },
  },
}

describe("History", () => {
  it("renders the history list container", async () => {
    await act(async () => render(<History data={mockData} />, { wrapper }))
    expect(screen.getByTestId("history-list")).toBeInTheDocument()
  })

  it("shows total worked time", async () => {
    const storedRecords = [
      { id: 1, date: "2026-03-11", total: "8h 00min", time: 8, points: ["08:00", "17:00"], user: "testuser" },
      { id: 2, date: "2026-03-12", total: "6h 30min", time: 6.5, points: ["09:00", "15:30"], user: "testuser" },
    ]

    mockDb.getByIndex
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(storedRecords)
    await act(async () => render(<History data={mockData} />, { wrapper }))
    expect(screen.getByTestId("total-worked")).toHaveTextContent("0h 0m")
  })

  it("hides total section when total is falsy", async () => {
    const noTotal = { ...mockData, days: { ...mockData.days, total: "" } }
    await act(async () => render(<History data={noTotal} />, { wrapper }))
    expect(screen.getByTestId("total-worked").parentElement).toHaveClass("hidden")
  })
})

describe("DayCard", () => {
  const dayData = { date: "2026-03-11", formatted: "8h00", total: 8, points: ["08:00", "12:00", "13:00", "17:00"] }

  it("renders the formatted date", () => {
    render(<DayCard date="2026-03-11" dayData={dayData} />)
    expect(screen.getByText(/quarta/i)).toBeInTheDocument()
  })

  it("renders the raw date", () => {
    render(<DayCard date="2026-03-11" dayData={dayData} />)
    expect(screen.getByText("2026-03-11")).toBeInTheDocument()
  })

  it("renders formatted worked time", () => {
    render(<DayCard date="2026-03-11" dayData={dayData} />)
    expect(screen.getByText("8h00")).toBeInTheDocument()
  })

  it("renders all time points", () => {
    render(<DayCard date="2026-03-11" dayData={dayData} />)
    dayData.points.forEach((p) => expect(screen.getByText(p)).toBeInTheDocument())
  })

  it("renders with no points without crashing", () => {
    render(<DayCard date="2026-03-11" dayData={{ ...dayData, points: [] }} />)
    expect(screen.getByText("8h00")).toBeInTheDocument()
  })
})
