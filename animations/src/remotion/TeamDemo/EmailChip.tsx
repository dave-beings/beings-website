import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { colors, fonts, radius } from '../../components/marketing/design-tokens'

interface EmailChipProps {
  /** The email address to display */
  email: string
  /** Frame when this chip starts appearing */
  startFrame: number
  /** If true, the email types character-by-character before becoming a chip */
  typeEffect: boolean
  /** Chars per frame for typing effect (default 1) */
  charsPerFrame?: number
}

const ChipBadge: React.FC<{ email: string; scale: number }> = ({ email, scale }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      background: colors.surface.gray100,
      borderRadius: radius.full,
      padding: '3px 8px 3px 10px',
      fontFamily: fonts.sans,
      fontSize: 11,
      fontWeight: 500,
      color: colors.text.primary,
      transform: `scale(${scale})`,
      transformOrigin: 'left center',
      whiteSpace: 'nowrap',
    }}
  >
    {email}
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M3.5 3.5L8.5 8.5M8.5 3.5L3.5 8.5"
        stroke={colors.text.muted}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  </span>
)

export const EmailChip: React.FC<EmailChipProps> = ({
  email,
  startFrame,
  typeEffect,
  charsPerFrame = 1,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  if (frame < startFrame) return null

  const elapsed = frame - startFrame

  if (typeEffect) {
    const totalChars = email.length
    const typingFrames = Math.ceil(totalChars / charsPerFrame)
    const charsTyped = Math.min(totalChars, Math.floor(elapsed * charsPerFrame))
    const typingDone = charsTyped >= totalChars

    // Blinking cursor during typing
    const cursorOpacity = !typingDone
      ? interpolate(frame % 16, [0, 8, 16], [1, 0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 0

    // Still typing — show text in input style
    if (!typingDone) {
      return (
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: 13,
            color: colors.text.primary,
          }}
        >
          {email.slice(0, charsTyped)}
          <span
            style={{
              opacity: cursorOpacity,
              color: colors.brand.primary,
              fontWeight: 400,
              marginLeft: 1,
            }}
          >
            {'\u258C'}
          </span>
        </span>
      )
    }

    // Typing just finished — immediately spring into chip (no delay gap)
    const chipSpring = spring({
      frame: frame - (startFrame + typingFrames),
      fps,
      config: { damping: 30, stiffness: 180 },
    })
    const chipScale = interpolate(chipSpring, [0, 1], [0.85, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })

    return <ChipBadge email={email} scale={chipScale} />
  }

  // Stagger-appear (no typing): smooth spring scale
  const appearSpring = spring({
    frame: elapsed,
    fps,
    config: { damping: 30, stiffness: 180 },
  })
  const appearScale = interpolate(appearSpring, [0, 1], [0.6, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const appearOpacity = interpolate(appearSpring, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <span style={{ opacity: appearOpacity }}>
      <ChipBadge email={email} scale={appearScale} />
    </span>
  )
}
