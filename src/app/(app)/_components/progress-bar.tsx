"use client"

type Props = {
  percentage: number
  worked: number
  expected: number
  points: string[]
}

export function ProgressBar({ percentage, worked, expected, points: rawMcs }: Props) {
  const mcs = rawMcs.map((m) => m.replace("e", ""))
  const totalExpectedMin = expected * 60

  function toMinutes(time: string) {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }

  function fmtMin(min: number) {
    const hours = Math.floor(min / 60)
    const minutes = Math.round(min % 60)
    return `${hours}h ${minutes < 10 ? "0" + minutes : minutes}min`
  }

  const renderSimpleBar = () => (
    <div
      className="bg-blue-500 h-2 rounded-full transition-all"
      style={{ width: `${Math.min(percentage, 100)}%` }}
    />
  )

  const renderSegmentedBar = () => {
    const firstPunch = toMinutes(mcs[0])
    const lunchOut = toMinutes(mcs[1])
    const lunchIn = mcs.length >= 3 ? toMinutes(mcs[2]) : null

    if (isNaN(firstPunch) || isNaN(lunchOut) || lunchOut <= firstPunch) {
      return renderSimpleBar()
    }

    if (lunchIn !== null && (isNaN(lunchIn) || lunchIn <= lunchOut)) {
      return renderSimpleBar()
    }

    const workBeforeLunch = Math.min(lunchOut - firstPunch, totalExpectedMin)
    const workBeforePct = (workBeforeLunch / totalExpectedMin) * 100

    let lunchPct = 0
    let workAfterPct = 0

    if (lunchIn !== null) {
      const lunchDuration = lunchIn - lunchOut
      lunchPct = (lunchDuration / totalExpectedMin) * 100

      if (mcs.length >= 4) {
        const lastPunch = toMinutes(mcs[3])

        if (isNaN(lastPunch) || lastPunch <= lunchIn) {
          const total = workBeforePct + lunchPct
          const scale = total > 100 ? 100 / total : 1

          return (
            <>
              <div
                className="bg-blue-500 h-[10px] transition-all first:rounded-l-full tooltip-container"
                style={{ width: `${workBeforePct * scale}%` }}>
                <span className="progress-tooltip">
                  {`${fmtMin(workBeforeLunch)} (${mcs[0]} - ${mcs[1]})`}
                </span>
              </div>
              <div
                className="bg-amber-500 h-[10px] transition-all last:rounded-r-full tooltip-container"
                style={{ width: `${lunchPct * scale}%` }}>
                <span className="progress-tooltip">
                  {`${fmtMin(lunchIn - lunchOut)} (${mcs[1]} - ${mcs[2]})`}
                </span>
              </div>
            </>
          )
        }

        const workAfter = Math.min(lastPunch - lunchIn, totalExpectedMin - workBeforeLunch)
        workAfterPct = Math.max((workAfter / totalExpectedMin) * 100, 0)
      } else {
        const workedMin = worked * 60
        const workAfter = Math.max(workedMin - workBeforeLunch, 0)
        workAfterPct = (workAfter / totalExpectedMin) * 100
      }
    }

    const total = workBeforePct + lunchPct + workAfterPct
    const scale = total > 100 ? 100 / total : 1

    return (
      <>
        <div
          className="bg-blue-500 h-[10px] transition-all first:rounded-l-full tooltip-container"
          style={{ width: `${workBeforePct * scale}%` }}>
          <span className="progress-tooltip">
            {`${fmtMin(workBeforeLunch)} (${mcs[0]} - ${mcs[1]})`}
          </span>
        </div>
        {lunchPct > 0 && (
          <div
            className="bg-amber-500 h-[10px] transition-all tooltip-container"
            style={{ width: `${lunchPct * scale}%` }}>
            <span className="progress-tooltip">
              {`${fmtMin(lunchIn! - lunchOut)} (${mcs[1]} - ${mcs[2]})`}
            </span>
          </div>
        )}
        {workAfterPct > 0 && (
          <div
            className="bg-blue-500 h-[10px] transition-all last:rounded-r-full tooltip-container"
            style={{ width: `${workAfterPct * scale}%` }}>
            <span className="progress-tooltip">
              {`${fmtMin(workAfterPct * totalExpectedMin / 100)} (${mcs[2]} - ${mcs.length >= 4 ? mcs[3] : "Agora"})`}
            </span>
          </div>
        )}
      </>
    )
  }

  const hasSegments = mcs.length >= 2 && expected > 0

  return (
    <div className="mb-4" data-testid="progress">
      <div className="flex justify-between text-sm mb-1 text-gray-300">
        <span>Progresso</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full rounded-full h-[10px] flex relative gap-x-[1px] bg-neutral-700/60">
        {hasSegments ? renderSegmentedBar() : renderSimpleBar()}
      </div>
    </div>
  )
}
