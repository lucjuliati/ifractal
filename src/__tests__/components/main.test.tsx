import { render, screen, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { Main } from "@/app/(app)/_components/main"
import { TimeClockData } from "@/lib/types"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock("@/components/time-clock", () => ({
  TimeClock: ({ data }: { data: TimeClockData }) => <div data-testid="time-clock">{data.user}</div>,
}))

vi.mock("@/components/chart", () => ({
  Chart: () => <div data-testid="chart-mock" />,
}))

vi.mock("@/components/history", () => ({
  History: () => <div data-testid="history-mock" />,
}))

const mockData = {
  user: "testuser",
  dados: {
    perct_trabalhado: 75,
    previsto: 8,
    tot_trabalhado: "6h00",
    data: "2026-03-13",
    trabalhado: 6,
    str_data: "Quarta-feira",
    mcs: ["08:00", "12:00"],
  },
  days: { total: "+0h30", data: {} },
}

describe("Main", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("renders child components", async () => {
    await act(async () => render(<Main initialData={JSON.stringify(mockData)} />))
    expect(screen.getByTestId("time-clock")).toBeInTheDocument()
    expect(screen.getByTestId("chart-mock")).toBeInTheDocument()
    expect(screen.getByTestId("history-mock")).toBeInTheDocument()
  })

  it("passes parsed data to TimeClock", async () => {
    await act(async () => render(<Main initialData={JSON.stringify(mockData)} />))
    expect(screen.getByTestId("time-clock")).toHaveTextContent("testuser")
  })

  it("sets up polling interval", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => JSON.stringify(mockData),
    })
    global.fetch = fetchSpy as never

    await act(async () => render(<Main initialData={JSON.stringify(mockData)} />))

    await act(async () => {
      vi.advanceTimersByTime(60_000)
    })

    expect(screen.getByTestId("time-clock")).toBeInTheDocument()
  })
})
