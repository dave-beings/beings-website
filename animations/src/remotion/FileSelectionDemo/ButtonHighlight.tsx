import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'

interface ButtonHighlightProps {
  /** Frame when the button is clicked */
  clickFrame: number
  /** Position and size in card-relative pixels */
  x: number
  y: number
  width: number
  height: number
}

export const ButtonHighlight: React.FC<ButtonHighlightProps> = ({
  clickFrame,
  x,
  y,
  width,
  height,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  if (frame < clickFrame) return null

  // Scale pulse on click
  const pulseProgress = spring({
    frame: frame - clickFrame,
    fps,
    config: { damping: 20, stiffness: 200 },
  })
  const scale = interpolate(pulseProgress, [0, 0.5, 1], [1, 0.95, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Fade out after ~20 frames
  const opacity = interpolate(frame - clickFrame, [0, 8, 20], [0.8, 0.6, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  if (opacity <= 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        background: 'rgba(4, 156, 240, 0.15)',
        borderRadius: 6,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'center',
        pointerEvents: 'none',
      }}
    />
  )
}
