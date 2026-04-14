import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { colors, fonts } from '../../components/marketing/design-tokens'

interface UserMessageProps {
  /** Frame when the sent message appears */
  appearFrame: number
  /** Frame when it fades out (loop) */
  fadeOutFrame: number
  /** Position in card-relative coords */
  x: number
  y: number
  width: number
}

const MESSAGE_TEXT =
  'Summarise the three most prominent themes in these interviews through the lens of what feedback we need to most note in order to ultimately make the patient experience better'

export const UserMessage: React.FC<UserMessageProps> = ({
  appearFrame,
  fadeOutFrame,
  x,
  y,
  width,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  if (frame < appearFrame) return null

  const fadeOut = interpolate(frame, [fadeOutFrame, fadeOutFrame + 20], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  if (fadeOut <= 0) return null

  // Spring scale entrance
  const scaleIn = spring({
    frame: frame - appearFrame,
    fps,
    config: { damping: 200 },
    durationInFrames: 12,
  })

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        opacity: fadeOut,
        transform: `scale(${interpolate(scaleIn, [0, 1], [0.95, 1])})`,
        transformOrigin: 'bottom right',
      }}
    >
      <div
        style={{
          background: colors.brand.primary,
          borderRadius: 6,
          padding: '6px 8px',
          fontFamily: fonts.sans,
          fontSize: 6.5,
          lineHeight: 1.5,
          color: '#FFFFFF',
          wordWrap: 'break-word',
        }}
      >
        {MESSAGE_TEXT}
      </div>
    </div>
  )
}
