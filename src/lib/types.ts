export interface TimeClockData {
  user: string
  dados: {
    perct_trabalhado: number
    tot_trabalhado: string
    previsto: number
    data: string
    trabalhado: number
    str_data: string
    mcs: string[]
  }
  days: {
    total: string
    data: Record<string, {
      date: string
      formatted: string
      total: number
      points: string[]
    }>
  }
}

export type StoredRecord = {
  id: number
  date: string
  total: string
  time: number
  points: string[]
  user: string
}

export type LocalDaysData = TimeClockData["days"]["data"]