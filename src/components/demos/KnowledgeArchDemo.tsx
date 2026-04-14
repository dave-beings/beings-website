import { useId } from 'react'
import { useAnimationLoop, lerp } from './shared/useAnimationLoop'

const T = {
  duration: 10,
  cardEnterEnd: 0.67,
  circle1Start: 0.83,
  circle2Start: 1.5,
  circle3Start: 2.17,
  circleRevealDuration: 1,
  labelFadeDuration: 0.28,
  label1Start: 3.0,
  label2Start: 3.33,
  label3Start: 3.67,
  dotsStart: 3.5,
  glowStart: 4.67,
  glowEnd: 5.83,
  shieldStart: 5.67,
  shieldDuration: 1,
  taglineStart: 6.83,
  taglineDuration: 0.45,
  loopFadeStart: 9.33,
  loopFadeEnd: 9.97,
} as const

const W = 800
const H = 500

/** Ease-out-back — springy settle without overshoot past zero */
function easeOutBack(t: number): number {
  const c1 = 1.525
  const c3 = c1 + 1
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2
}

function springScale01(time: number, start: number): number {
  if (time < start) return 0
  const u = Math.min(1, (time - start) / T.circleRevealDuration)
  const raw = easeOutBack(u)
  return Math.min(raw, 1.035)
}

function labelOpacity(time: number, labelStart: number): number {
  return lerp(time, labelStart, labelStart + T.labelFadeDuration, 0, 1)
}

const VENN_W = 380
const VENN_H = 300
const R = 105

const CENTERS = {
  personal: { cx: 125, cy: 100 },
  project: { cx: 255, cy: 100 },
  org: { cx: 190, cy: 188 },
} as const

const DOTS: {
  key: string
  which: keyof typeof CENTERS
  startAngle: number
  speed: number
}[] = [
  { key: 'p0', which: 'personal', startAngle: 0.2, speed: 0.42 },
  { key: 'p1', which: 'personal', startAngle: Math.PI + 0.4, speed: 0.38 },
  { key: 'j0', which: 'project', startAngle: 1.1, speed: 0.5 },
  { key: 'j1', which: 'project', startAngle: Math.PI + 1.3, speed: 0.44 },
  { key: 'o0', which: 'org', startAngle: 2.0, speed: 0.36 },
  { key: 'o1', which: 'org', startAngle: Math.PI + 2.2, speed: 0.41 },
]

const COLORS = {
  personal: { fill: 'rgba(91, 111, 204, 0.15)', dot: 'rgb(91, 111, 204)' },
  project: { fill: 'rgba(126, 87, 194, 0.15)', dot: 'rgb(126, 87, 194)' },
  org: { fill: 'rgba(34, 197, 94, 0.15)', dot: 'rgb(34, 197, 94)' },
} as const

const SHIELD_CENTER = { x: 190, y: 129 }

export default function KnowledgeArchDemo() {
  const { time, containerRef, reducedMotion } = useAnimationLoop({ duration: T.duration })
  const filterId = useId().replace(/:/g, '')

  const cardPop = Math.min(1, time / T.cardEnterEnd)
  const cardScale = 0.95 + 0.05 * (1 - (1 - cardPop) ** 3)
  const cardOpacity = Math.min(1, cardPop * 2)
  const loopFade = lerp(time, T.loopFadeStart, T.loopFadeEnd, 1, 0)
  const containerOpacity = Math.min(cardOpacity, loopFade)

  const s1 = springScale01(time, T.circle1Start)
  const s2 = springScale01(time, T.circle2Start)
  const s3 = springScale01(time, T.circle3Start)

  const headingOpacity = lerp(time, T.circle1Start, T.circle1Start + 0.35, 0, 1)

  const glowPhase =
    time >= T.glowStart && time <= T.glowEnd ? (time - T.glowStart) / (T.glowEnd - T.glowStart) : 0
  const glowStrength = Math.sin(glowPhase * Math.PI)
  const blurPx = 2 + glowStrength * 10

  const shieldT = Math.min(1, Math.max(0, (time - T.shieldStart) / T.shieldDuration))
  const shieldScale = easeOutBack(shieldT)
  const shieldVisible = time >= T.shieldStart

  const tagT = Math.min(1, Math.max(0, (time - T.taglineStart) / T.taglineDuration))
  const tagEase = 1 - (1 - tagT) ** 3
  const tagOpacity = tagEase
  const tagY = (1 - tagEase) * 8

  const orbitT = Math.max(0, time - T.dotsStart)

  if (reducedMotion) {
    return (
      <div
        ref={containerRef}
        role="img"
        aria-label="Multi-corpus architecture: personal, project, and organisation knowledge stay isolated"
        style={{
          width: '100%',
          aspectRatio: `${W}/${H}`,
          borderRadius: 12,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-divider)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <span style={{ color: 'var(--color-text-secondary)', fontSize: 14, textAlign: 'center' }}>
          Multi-corpus architecture — three knowledge bases, zero cross-contamination
        </span>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Animated multi-corpus architecture diagram"
      style={{ width: '100%', aspectRatio: `${W}/${H}`, overflow: 'hidden', borderRadius: 12 }}
    >
      <div
        style={{
          width: W,
          height: H,
          transform: `scale(${containerRef.current ? containerRef.current.clientWidth / W : 1})`,
          transformOrigin: 'top left',
          position: 'relative',
          fontFamily: 'var(--font-family)',
          background: 'var(--color-background)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 24,
            borderRadius: 16,
            overflow: 'hidden',
            background: 'var(--color-surface)',
            boxShadow: 'var(--elevation-3)',
            border: '1px solid var(--color-divider)',
            transform: `scale(${cardScale})`,
            opacity: containerOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            paddingTop: 16,
            paddingBottom: 14,
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-primary)',
              textAlign: 'center',
              opacity: headingOpacity,
              marginBottom: 8,
            }}
          >
            Multi-Corpus Architecture
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
            <svg
              width={VENN_W}
              height={VENN_H}
              viewBox={`0 0 ${VENN_W} ${VENN_H}`}
              style={{ overflow: 'visible' }}
              aria-hidden
            >
              <defs>
                <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation={blurPx} result="b" />
                  <feColorMatrix
                    in="b"
                    type="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0"
                    result="c"
                  />
                  <feMerge>
                    <feMergeNode in="c" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g filter={time >= T.glowStart && time <= T.glowEnd ? `url(#${filterId})` : undefined}>
                <g
                  transform={`translate(${CENTERS.personal.cx} ${CENTERS.personal.cy}) scale(${s1}) translate(${-CENTERS.personal.cx} ${-CENTERS.personal.cy})`}
                >
                  <circle
                    cx={CENTERS.personal.cx}
                    cy={CENTERS.personal.cy}
                    r={R}
                    fill={COLORS.personal.fill}
                    stroke="var(--color-primary)"
                    strokeWidth={1.5}
                  />
                </g>
                <g
                  transform={`translate(${CENTERS.project.cx} ${CENTERS.project.cy}) scale(${s2}) translate(${-CENTERS.project.cx} ${-CENTERS.project.cy})`}
                >
                  <circle
                    cx={CENTERS.project.cx}
                    cy={CENTERS.project.cy}
                    r={R}
                    fill={COLORS.project.fill}
                    stroke="var(--color-secondary)"
                    strokeWidth={1.5}
                  />
                </g>
                <g
                  transform={`translate(${CENTERS.org.cx} ${CENTERS.org.cy}) scale(${s3}) translate(${-CENTERS.org.cx} ${-CENTERS.org.cy})`}
                >
                  <circle
                    cx={CENTERS.org.cx}
                    cy={CENTERS.org.cy}
                    r={R}
                    fill={COLORS.org.fill}
                    stroke="var(--color-success)"
                    strokeWidth={1.5}
                  />
                </g>
              </g>

              <text
                x={CENTERS.personal.cx}
                y={CENTERS.personal.cy - R - 10}
                textAnchor="middle"
                fill="var(--color-text-primary)"
                style={{
                  fontFamily: 'var(--font-family)',
                  fontSize: 12,
                  fontWeight: 600,
                  opacity: labelOpacity(time, T.label1Start),
                }}
              >
                Personal
              </text>
              <text
                x={CENTERS.project.cx}
                y={CENTERS.project.cy - R - 10}
                textAnchor="middle"
                fill="var(--color-text-primary)"
                style={{
                  fontFamily: 'var(--font-family)',
                  fontSize: 12,
                  fontWeight: 600,
                  opacity: labelOpacity(time, T.label2Start),
                }}
              >
                Project
              </text>
              <text
                x={CENTERS.org.cx}
                y={CENTERS.org.cy + R + 22}
                textAnchor="middle"
                fill="var(--color-text-primary)"
                style={{
                  fontFamily: 'var(--font-family)',
                  fontSize: 12,
                  fontWeight: 600,
                  opacity: labelOpacity(time, T.label3Start),
                }}
              >
                Organisation
              </text>

              {orbitT > 0 &&
                DOTS.map((d) => {
                  const c = CENTERS[d.which]
                  const ang = d.startAngle + orbitT * d.speed * Math.PI * 2
                  const x = c.cx + R * Math.cos(ang)
                  const y = c.cy + R * Math.sin(ang)
                  return (
                    <circle key={d.key} cx={x} cy={y} r={3} fill={COLORS[d.which].dot} />
                  )
                })}

              {shieldVisible && shieldScale > 0.01 && (
                <g
                  transform={`translate(${SHIELD_CENTER.x} ${SHIELD_CENTER.y}) scale(${(shieldScale * 40) / 24}) translate(-12 -12)`}
                  style={{ pointerEvents: 'none' }}
                >
                  <path
                    d="M12 2L4 6v5.09C4 16.14 7.41 20.85 12 22c4.59-1.15 8-5.86 8-10.91V6L12 2z"
                    fill="var(--color-primary)"
                    fillOpacity={0.25}
                    stroke="var(--color-primary)"
                    strokeWidth={1.25}
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 12.5l2 2 4-4"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth={1.75}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              )}
            </svg>
          </div>

          <div
            style={{
              textAlign: 'center',
              marginTop: 4,
              minHeight: 22,
              transform: `translateY(${tagY}px)`,
              opacity: tagOpacity,
            }}
          >
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Three knowledge bases
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text-secondary)' }}> · </span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Zero cross-contamination
            </span>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 26,
            right: 30,
            fontFamily: 'var(--font-family)',
            fontSize: 8,
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            letterSpacing: '0.04em',
            opacity: containerOpacity * 0.5,
          }}
        >
          beings.com
        </div>
      </div>
    </div>
  )
}
