import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { CenterShield } from './CenterShield'

const SVG_W = 700
const SVG_H = 380
const CX = 350
const CY = 178
const D = 68
const R = 100

const SIN60 = Math.sin(Math.PI / 3)
const COS60 = Math.cos(Math.PI / 3)

const CIRCLE_DEFS = [
  {
    cx: CX - D * SIN60,
    cy: CY - D * COS60,
    fill: 'rgba(4, 156, 240, 0.10)',
    stroke: '#049CF0',
    label: 'Personal',
  },
  {
    cx: CX + D * SIN60,
    cy: CY - D * COS60,
    fill: 'rgba(0, 212, 255, 0.10)',
    stroke: '#00D4FF',
    label: 'Project',
  },
  {
    cx: CX,
    cy: CY + D,
    fill: 'rgba(0, 51, 204, 0.10)',
    stroke: '#0033CC',
    label: 'Organisational',
  },
] as const

const LABEL_POSITIONS = [
  { x: CX - D * SIN60, y: CY - D * COS60 - R - 16 },
  { x: CX + D * SIN60, y: CY - D * COS60 - R - 16 },
  { x: CX, y: CY + D + R + 22 },
] as const

const R_SQ = R * R

function isInsideOtherCircle(x: number, y: number, ownerIdx: number): boolean {
  for (let j = 0; j < CIRCLE_DEFS.length; j++) {
    if (j === ownerIdx) continue
    const dx = x - CIRCLE_DEFS[j].cx
    const dy = y - CIRCLE_DEFS[j].cy
    if (dx * dx + dy * dy < R_SQ) return true
  }
  return false
}

function findSafePhase(ci: number, rx: number, ry: number, preferredPh: number): number {
  const owner = CIRCLE_DEFS[ci]
  const x = owner.cx + rx * Math.cos(preferredPh)
  const y = owner.cy + ry * Math.sin(preferredPh)
  if (!isInsideOtherCircle(x, y, ci)) return preferredPh

  for (let offset = 0.05; offset < Math.PI; offset += 0.05) {
    for (const sign of [1, -1]) {
      const candidate = preferredPh + sign * offset
      const cx2 = owner.cx + rx * Math.cos(candidate)
      const cy2 = owner.cy + ry * Math.sin(candidate)
      if (!isInsideOtherCircle(cx2, cy2, ci)) return candidate
    }
  }
  return preferredPh
}

const DOT_CONFIGS_RAW = [
  { ci: 0, rx: 58, ry: 42, spd: 0.042, ph: 0, sz: 3.5 },
  { ci: 0, rx: 35, ry: 52, spd: -0.033, ph: 2.1, sz: 2.5 },
  { ci: 0, rx: 62, ry: 28, spd: 0.025, ph: 4.2, sz: 3 },
  { ci: 1, rx: 52, ry: 38, spd: -0.038, ph: 0.9, sz: 3.5 },
  { ci: 1, rx: 42, ry: 55, spd: 0.03, ph: 3.4, sz: 2.5 },
  { ci: 1, rx: 58, ry: 32, spd: -0.045, ph: 5.5, sz: 3 },
  { ci: 2, rx: 48, ry: 52, spd: 0.035, ph: 1.6, sz: 3.5 },
  { ci: 2, rx: 62, ry: 32, spd: -0.028, ph: 4.8, sz: 2.5 },
  { ci: 2, rx: 38, ry: 48, spd: 0.04, ph: 0.4, sz: 3 },
]

const DOT_CONFIGS = DOT_CONFIGS_RAW.map((d) => ({
  ...d,
  ph: findSafePhase(d.ci, d.rx, d.ry, d.ph),
}))

function simulateDot(
  dot: (typeof DOT_CONFIGS)[number],
  elapsed: number,
): { x: number; y: number } {
  const owner = CIRCLE_DEFS[dot.ci]
  let angle = dot.ph
  let speed = dot.spd

  for (let f = 0; f < elapsed; f++) {
    const nextAngle = angle + speed
    const nx = owner.cx + dot.rx * Math.cos(nextAngle)
    const ny = owner.cy + dot.ry * Math.sin(nextAngle)

    if (isInsideOtherCircle(nx, ny, dot.ci)) {
      speed = -speed
    } else {
      angle = nextAngle
    }
  }

  return {
    x: owner.cx + dot.rx * Math.cos(angle),
    y: owner.cy + dot.ry * Math.sin(angle),
  }
}

interface VennDiagramProps {
  circleRevealFrames: readonly [number, number, number]
  circleRevealDuration: number
  labelRevealFrames: readonly [number, number, number]
  dotsStartFrame: number
  glowPulseStart: number
  glowPulseEnd: number
  shieldRevealFrame: number
  shieldRevealDuration: number
}

export const VennDiagram: React.FC<VennDiagramProps> = ({
  circleRevealFrames,
  circleRevealDuration,
  labelRevealFrames,
  dotsStartFrame,
  glowPulseStart,
  glowPulseEnd,
  shieldRevealFrame,
  shieldRevealDuration,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const radii = CIRCLE_DEFS.map((_, i) => {
    const progress = spring({
      frame: frame - circleRevealFrames[i],
      fps,
      config: { damping: 200 },
      durationInFrames: circleRevealDuration,
    })
    return interpolate(progress, [0, 1], [0, R])
  })

  const labelAnims = CIRCLE_DEFS.map((_, i) => ({
    opacity: interpolate(frame, [labelRevealFrames[i], labelRevealFrames[i] + 15], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    dy: interpolate(frame, [labelRevealFrames[i], labelRevealFrames[i] + 15], [6, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  }))

  const glowMid = (glowPulseStart + glowPulseEnd) / 2
  const strokeOp = interpolate(
    frame,
    [glowPulseStart, glowMid, glowPulseEnd],
    [0.35, 0.85, 0.45],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )

  const dotAlpha = interpolate(frame, [dotsStartFrame, dotsStartFrame + 20], [0, 0.6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ width: '100%', height: '100%' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {CIRCLE_DEFS.map((c, i) => (
          <clipPath key={i} id={`ka-clip-${i}`}>
            <circle cx={c.cx} cy={c.cy} r={radii[i]} />
          </clipPath>
        ))}
        <radialGradient id="ka-shield-glow">
          <stop offset="0%" stopColor="#049CF0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#049CF0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {CIRCLE_DEFS.map((c, i) => (
        <circle
          key={`c-${i}`}
          cx={c.cx}
          cy={c.cy}
          r={radii[i]}
          fill={c.fill}
          stroke={c.stroke}
          strokeWidth={1.5}
          strokeOpacity={radii[i] > 2 ? strokeOp : 0}
        />
      ))}

      {[0, 1, 2].map((ci) => (
        <g key={`dg-${ci}`} clipPath={`url(#ka-clip-${ci})`}>
          {DOT_CONFIGS.filter((d) => d.ci === ci).map((dot, di) => {
            const elapsed = Math.max(0, frame - dotsStartFrame)
            const { x, y } = simulateDot(dot, elapsed)
            return (
              <circle
                key={di}
                cx={x}
                cy={y}
                r={dot.sz}
                fill={CIRCLE_DEFS[ci].stroke}
                opacity={dotAlpha}
              />
            )
          })}
        </g>
      ))}

      {CIRCLE_DEFS.map((c, i) => (
        <g
          key={`lb-${i}`}
          opacity={labelAnims[i].opacity}
          transform={`translate(0, ${labelAnims[i].dy})`}
        >
          <text
            x={LABEL_POSITIONS[i].x}
            y={LABEL_POSITIONS[i].y}
            textAnchor="middle"
            fill={c.stroke}
            fontSize={12}
            fontWeight={600}
            fontFamily="Poppins, system-ui, sans-serif"
          >
            {c.label}
          </text>
        </g>
      ))}

      <CenterShield
        cx={CX}
        cy={CY}
        revealFrame={shieldRevealFrame}
        revealDuration={shieldRevealDuration}
      />
    </svg>
  )
}
