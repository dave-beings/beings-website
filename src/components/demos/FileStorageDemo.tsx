import { useRef, useEffect, useState } from 'react'
import { useAnimationLoop, lerp } from './shared/useAnimationLoop'
import { AnimatedCursor } from './shared/AnimatedCursor'

const T = {
  duration: 10.33,
  titleAppear: 0.27,
  tableHeaderStart: 1.0,
  tableHeaderEnd: 1.67,
  row1Start: 1.83,
  row2Start: 2.83,
  row3Start: 3.83,
  rowSlideDuration: 0.4,
  statsStart: 4.83,
  statsEnd: 6.5,
  cursorEnter: 7.0,
  cursorClick: 8.0,
  cursorExit: 9.33,
  cursorTargetX: 120,
  cursorTargetY: 98,
  searchFocusTime: 8.0,
  loopFadeStart: 9.67,
  loopFadeEnd: 10.33,
} as const

const STATS = [
  { label: 'mins', target: 204 },
  { label: 'words', target: 39260 },
  { label: 'sources', target: 10 },
]

const ROWS = [
  { name: 'user_research_summary.pdf', location: 'Reactions to New Driverless Car Feature', size: '3.57 Kb', type: 'pdf', date: '27 Jan 2026', time: '8:26 pm' },
  { name: 'Interview Transcripts \u2013 Pres copy.pdf', location: 'Participant in Research Experience Survey (PRES)', size: '25.67 Kb', type: 'pdf', date: '27 Jan 2026', time: '8:03 pm' },
  { name: 'Participant Interview Transcripts.pdf', location: 'Participant in Research Experience Survey (PRES)', size: '25.67 Kb', type: 'pdf', date: '27 Jan 2026', time: '8:03 pm' },
]

const W = 800
const H = 500

function FileTableRow({ row, time, startTime, slideDuration }: { row: typeof ROWS[0]; time: number; startTime: number; slideDuration: number }) {
  if (time < startTime - 0.03) return null
  const progress = Math.max(0, Math.min(1, (time - startTime) / slideDuration))
  const eased = 1 - Math.pow(1 - progress, 3)
  const translateX = 40 * (1 - eased)

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid var(--color-divider)', opacity: eased, transform: `translateX(${translateX}px)` }}>
      <div style={{ width: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 14, height: 14, borderRadius: 3, border: '1.5px solid var(--color-divider)', background: 'var(--color-surface)' }} />
      </div>
      <div style={{ width: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 24, height: 24, borderRadius: 4, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M4 2C4 .9 4.9 0 6 0H12L18 6V18C18 19.1 17.1 20 16 20H6C4.9 20 4 19.1 4 18V2Z" fill="#EF4444" opacity={0.2} /><text x="10" y="15" textAnchor="middle" fill="#EF4444" fontSize="6.5" fontWeight="700" fontFamily="system-ui">PDF</text></svg>
        </div>
      </div>
      <div style={{ flex: '1 1 0', minWidth: 0, fontSize: 10, fontWeight: 500, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.name}</div>
      <div style={{ width: 220, flexShrink: 0, fontSize: 10, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.location}</div>
      <div style={{ width: 52, flexShrink: 0, fontSize: 10, color: 'var(--color-text-secondary)', textAlign: 'right', paddingRight: 10 }}>{row.size}</div>
      <div style={{ width: 30, flexShrink: 0, fontSize: 10, color: 'var(--color-text-secondary)' }}>{row.type}</div>
      <div style={{ width: 72, flexShrink: 0, fontSize: 10, color: 'var(--color-text-secondary)', textAlign: 'right' }}>{row.date}</div>
      <div style={{ width: 24, flexShrink: 0 }} />
    </div>
  )
}

export default function FileStorageDemo() {
  const { time, containerRef, reducedMotion } = useAnimationLoop({ duration: T.duration })
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!wrapperRef.current) return
    const obs = new ResizeObserver(([e]) => setScale(e.contentRect.width / W))
    obs.observe(wrapperRef.current)
    return () => obs.disconnect()
  }, [])

  const entranceFade = lerp(time, 0, 0.5, 0, 1)
  const loopFade = lerp(time, T.loopFadeStart, T.loopFadeEnd, 1, 0)
  const opacity = Math.min(entranceFade, loopFade)

  const cardProgress = Math.max(0, Math.min(1, time / 0.83))
  const cardEased = 1 - Math.pow(1 - cardProgress, 3)
  const cardY = 20 * (1 - cardEased)

  const titleProgress = Math.max(0, Math.min(1, (time - T.titleAppear) / 0.67))
  const titleEased = 1 - Math.pow(1 - titleProgress, 3)
  const titleY = 12 * (1 - titleEased)

  const headerProgress = Math.max(0, Math.min(1, (time - T.tableHeaderStart) / (T.tableHeaderEnd - T.tableHeaderStart)))
  const headerEased = 1 - Math.pow(1 - headerProgress, 3)

  const isFocused = time >= T.searchFocusTime

  if (reducedMotion) {
    return <div ref={wrapperRef} role="img" aria-label="File storage panel" style={{ width: '100%', aspectRatio: `${W}/${H}`, borderRadius: 12, background: 'var(--color-surface)', border: '1px solid var(--color-divider)' }} />
  }

  return (
    <div ref={(n) => { (wrapperRef as any).current = n; (containerRef as any).current = n }} role="img" aria-label="Animated file storage panel" style={{ width: '100%', aspectRatio: `${W}/${H}`, overflow: 'hidden', borderRadius: 12 }}>
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'relative', fontFamily: 'var(--font-family)', opacity }}>
        <div style={{ position: 'absolute', inset: 16, borderRadius: 16, overflow: 'hidden', background: 'var(--color-surface)', boxShadow: 'var(--elevation-3)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', transform: `translateY(${cardY}px)` }}>
          {/* Header */}
          <div style={{ padding: '16px 16px 12px' }}>
            <div style={{ opacity: titleEased, transform: `translateY(${titleY}px)` }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>Recent</div>
            </div>
            {/* Stats */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 12, fontSize: 11, color: 'var(--color-text-secondary)' }}>
              {STATS.map((stat, i) => {
                const statStart = T.statsStart + i * 0.27
                const statProgress = Math.max(0, Math.min(1, (time - statStart) / (T.statsEnd - statStart)))
                const value = Math.round(stat.target * statProgress)
                const statOpacity = lerp(time, statStart, statStart + 0.33, 0, 1)
                return (
                  <span key={stat.label} style={{ opacity: statOpacity }}>
                    {i > 0 && <span style={{ margin: '0 4px', color: 'var(--color-text-secondary)', opacity: 0.5 }}>|</span>}
                    {value.toLocaleString()} {stat.label}
                  </span>
                )
              })}
            </div>
            {/* Search */}
            <div style={{ opacity: titleEased, transform: `translateY(${titleY}px)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.02)', borderRadius: 8, padding: '6px 10px', border: isFocused ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-divider)', width: 180 }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="var(--color-text-secondary)" strokeWidth="1.5" opacity="0.5" /><path d="M11 11L14 14" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" /></svg>
                <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', opacity: 0.6 }}>Search by title</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, border: '1.5px solid var(--color-divider)', fontSize: 11, fontWeight: 500, color: 'var(--color-text-primary)' }}>Latest</div>
              </div>
            </div>
          </div>

          {/* Table header */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 14px', background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--color-divider)', borderTop: '1px solid var(--color-divider)', opacity: headerEased }}>
            <div style={{ width: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, border: '1.5px solid var(--color-divider)', background: 'var(--color-surface)' }} />
            </div>
            <div style={{ width: 40, flexShrink: 0 }} />
            <div style={{ flex: '1 1 0', fontSize: 10, fontWeight: 600, color: 'var(--color-text-primary)' }}>Name</div>
            <div style={{ width: 220, flexShrink: 0, fontSize: 10, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Location</div>
            <div style={{ width: 52, flexShrink: 0, fontSize: 10, fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right', paddingRight: 10 }}>Size</div>
            <div style={{ width: 30, flexShrink: 0, fontSize: 10, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Type</div>
            <div style={{ width: 72, flexShrink: 0, fontSize: 10, fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Modified</div>
            <div style={{ width: 24, flexShrink: 0 }} />
          </div>

          {/* Rows */}
          <div style={{ flex: 1 }}>
            {ROWS.map((row, i) => (
              <FileTableRow key={i} row={row} time={time} startTime={[T.row1Start, T.row2Start, T.row3Start][i]} slideDuration={T.rowSlideDuration} />
            ))}
          </div>
        </div>

        <AnimatedCursor time={time} enterTime={T.cursorEnter} clickTime={T.cursorClick} exitTime={T.cursorExit} targetX={T.cursorTargetX} targetY={T.cursorTargetY} />
        <div style={{ position: 'absolute', bottom: 22, right: 26, fontSize: 8, fontWeight: 500, color: 'var(--color-text-secondary)', letterSpacing: '0.04em', opacity: 0.5 }}>beings.com</div>
      </div>
    </div>
  )
}
