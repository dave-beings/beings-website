import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

interface CenterShieldProps {
  cx: number
  cy: number
  revealFrame: number
  revealDuration: number
}

export const CenterShield: React.FC<CenterShieldProps> = ({
  cx,
  cy,
  revealFrame,
  revealDuration,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const progress = spring({
    frame: frame - revealFrame,
    fps,
    config: { damping: 15, stiffness: 180 },
    durationInFrames: revealDuration,
  })

  if (progress < 0.01) return null

  const scale = interpolate(progress, [0, 1], [0, 1])
  const glowOpacity = interpolate(progress, [0, 1], [0, 0.25])

  return (
    <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
      <circle r={26} fill="url(#ka-shield-glow)" opacity={glowOpacity * 2} />
      <circle
        r={20}
        fill="none"
        stroke="#049CF0"
        strokeWidth={1}
        opacity={glowOpacity}
      />

      <path
        d="M0 -14 L12 -8 L12 4 C12 12 6 16 0 18 C-6 16 -12 12 -12 4 L-12 -8 Z"
        fill="#049CF0"
        opacity={0.95}
      />
      <path
        d="M0 -14 L12 -8 L12 4 C12 12 6 16 0 18 C-6 16 -12 12 -12 4 L-12 -8 Z"
        fill="none"
        stroke="#fff"
        strokeWidth={0.5}
        opacity={0.4}
      />

      <path
        d="M-4 2 L-1 5 L5 -2"
        fill="none"
        stroke="#fff"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  )
}
