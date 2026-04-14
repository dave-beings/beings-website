import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { colors, fonts, radius, shadows } from '../../components/marketing/design-tokens'

interface OrgModalProps {
  /** Frame when typing begins in the org name input */
  typeStartFrame: number
  /** Frame when typing ends */
  typeEndFrame: number
  /** Opacity for crossfade out (0..1) */
  opacity: number
  /** Frame when cursor clicks the "Create Organisation" button */
  buttonClickFrame: number
}

const ORG_NAME = 'AZ Patient Data Project'
const CHARS_PER_FRAME = 1.2

export const OrgModal: React.FC<OrgModalProps> = ({
  typeStartFrame,
  typeEndFrame: _typeEndFrame,
  opacity,
  buttonClickFrame,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Typewriter for org name
  const typeElapsed = Math.max(0, frame - typeStartFrame)
  const charsTyped = Math.min(ORG_NAME.length, Math.floor(typeElapsed * CHARS_PER_FRAME))
  const typingDone = charsTyped >= ORG_NAME.length
  const showCursor = frame >= typeStartFrame && !typingDone

  // Blinking cursor
  const cursorOpacity = showCursor
    ? interpolate(frame % 16, [0, 8, 16], [1, 0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0

  // Pre-typing blinking cursor (before typing starts, after modal appears)
  const preTypeCursor = frame < typeStartFrame
    ? interpolate(frame % 16, [0, 8, 16], [1, 0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0

  // Button press animation
  const buttonPress = frame >= buttonClickFrame
    ? spring({
        frame: frame - buttonClickFrame,
        fps,
        config: { damping: 20, stiffness: 200 },
      })
    : 0
  const buttonScale = frame >= buttonClickFrame
    ? interpolate(buttonPress, [0, 0.5, 1], [1, 0.95, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '40px 48px',
        opacity,
        position: 'absolute',
        inset: 0,
      }}
    >
      {/* Modal icon */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.md,
          background: `linear-gradient(135deg, ${colors.brand.primary}, ${colors.brand.primaryLight})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          boxShadow: shadows.soft,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 2C7.24 2 5 4.24 5 7C5 9.76 7.24 12 10 12C12.76 12 15 9.76 15 7C15 4.24 12.76 2 10 2Z"
            fill="white"
            opacity="0.9"
          />
          <path
            d="M3 17C3 14.24 6.13 12 10 12C13.87 12 17 14.24 17 17"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* Title */}
      <h2
        style={{
          fontFamily: fonts.sans,
          fontSize: 22,
          fontWeight: 600,
          color: colors.text.primary,
          margin: '0 0 4px',
          lineHeight: 1.3,
        }}
      >
        New Organisation
      </h2>
      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: 14,
          color: colors.text.secondary,
          margin: '0 0 24px',
          lineHeight: 1.5,
        }}
      >
        Create a shared workspace for your research team
      </p>

      {/* Organisation name input */}
      <label
        style={{
          fontFamily: fonts.sans,
          fontSize: 13,
          fontWeight: 600,
          color: colors.text.primary,
          marginBottom: 6,
          display: 'block',
        }}
      >
        Organisation name
      </label>
      <div
        style={{
          border: `1.5px solid ${frame >= typeStartFrame ? colors.brand.primary : colors.surface.gray200}`,
          borderRadius: radius.sm,
          padding: '10px 12px',
          fontFamily: fonts.sans,
          fontSize: 15,
          color: colors.text.primary,
          background: colors.surface.white,
          minHeight: 20,
          marginBottom: 32,
          transition: 'none',
          boxShadow: frame >= typeStartFrame
            ? `0 0 0 3px rgba(4, 156, 240, 0.1)`
            : 'none',
        }}
      >
        {charsTyped > 0 && ORG_NAME.slice(0, charsTyped)}
        {showCursor && (
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
        )}
        {frame < typeStartFrame && (
          <span
            style={{
              opacity: preTypeCursor,
              color: colors.brand.primary,
              fontWeight: 400,
            }}
          >
            {'\u258C'}
          </span>
        )}
        {typingDone && !showCursor && frame < typeStartFrame + 100 && null}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Buttons row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 10,
        }}
      >
        <button
          style={{
            fontFamily: fonts.sans,
            fontSize: 14,
            fontWeight: 500,
            color: colors.text.secondary,
            background: 'transparent',
            border: `1px solid ${colors.surface.gray200}`,
            borderRadius: radius.sm,
            padding: '8px 18px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          style={{
            fontFamily: fonts.sans,
            fontSize: 14,
            fontWeight: 600,
            color: colors.surface.white,
            background: colors.text.primary,
            border: 'none',
            borderRadius: radius.sm,
            padding: '8px 22px',
            cursor: 'pointer',
            transform: `scale(${buttonScale})`,
            opacity: typingDone ? 1 : 0.5,
          }}
        >
          Create Organisation
        </button>
      </div>
    </div>
  )
}
