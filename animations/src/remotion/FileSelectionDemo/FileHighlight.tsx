import { useCurrentFrame, interpolate } from 'remotion'
import { colors } from '../../components/marketing/design-tokens'

interface FileHighlightProps {
  /** Frame when highlight appears (file click) */
  appearFrame: number
  /** Frame when highlight starts fading out (loop fade) */
  fadeOutFrame: number
  /** Position and size in card-relative pixels */
  x: number
  y: number
  width: number
  height: number
}

export const FileHighlight: React.FC<FileHighlightProps> = ({
  appearFrame,
  fadeOutFrame,
  x,
  y,
  width,
  height,
}) => {
  const frame = useCurrentFrame()

  if (frame < appearFrame) return null

  const fadeIn = interpolate(frame, [appearFrame, appearFrame + 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const fadeOut = interpolate(frame, [fadeOutFrame, fadeOutFrame + 20], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const opacity = Math.min(fadeIn, fadeOut)
  if (opacity <= 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        background: 'rgba(4, 156, 240, 0.08)',
        borderLeft: `3px solid ${colors.brand.primary}`,
        borderRadius: 4,
        opacity,
        pointerEvents: 'none',
      }}
    />
  )
}
