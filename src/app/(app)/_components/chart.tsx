"use client"
import { LocalDaysData } from "@/lib/types"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts"

type Props = {
  data: LocalDaysData
}

const EXPECTED_HOURS = 8

export function Chart({ data }: Props) {
  const chartData = Object.values(data)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({
      date: d.date.slice(5),
      total: d.total,
      formatted: d.formatted,
    }))

  return (
    <div className="w-full p-4" data-testid="chart">
      <small className="opacity-50 pl-6 mb-1">Últimos 7 dias</small>
      <ResponsiveContainer width="100%" height={300} className="outline-none mt-1">
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }} className="outline-none">
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis
            domain={[0, 10]}
            tickFormatter={(v) => `${v}h`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{ background: "#262626", borderRadius: "12px", border: "1px solid #606060" }}
            cursor={{ fill: "#525252", opacity: 0.3, cursor: "pointer" }}
            labelStyle={{ color: "#ffffff" }}
            itemStyle={{ color: "#cacaca" }}
            formatter={(_value, _name, props) => [
              props.payload.formatted,
              "Trabalhado",
            ]}
          />
          <ReferenceLine y={EXPECTED_HOURS} stroke="#f59e0b" strokeDasharray="12 2" label={{ value: "8h", position: "right", fontSize: 11 }} />
          <Bar
            dataKey="total"
            radius={[4, 4, 0, 0]}
            shape={(props) => {
              const { x, y, width, height, payload } = props
              const fill = payload.total >= EXPECTED_HOURS ? "#2f9c7b" : "#5e5f64ff"
              return <rect x={x} y={y} width={width} height={height} rx={4} ry={4} fill={fill} />
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
