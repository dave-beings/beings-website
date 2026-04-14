import { useCurrentFrame, interpolate } from 'remotion'
import { colors } from '../../components/marketing/design-tokens'

interface TypingOverlayProps {
  /** Frame when the white mask appears (before typing, to hide pre-rendered text) */
  maskStartFrame: number
  /** Frame when typing starts */
  typeStartFrame: number
  /** Frame when typing ends */
  typeEndFrame: number
  /** Left edge in composition-space pixels */
  x: number
  /** Top edge in composition-space pixels */
  y: number
  /** Width of the overlay */
  width: number
  /** Height of the overlay */
  height: number
}

const DESCRIPTION_TEXT =
  'This is for all those involved in the PRES for Alexander Hospital \u2013 March 2026.'

export const TypingOverlay: React.FC<TypingOverlayProps> = ({
  maskStartFrame,
  typeStartFrame,
  typeEndFrame,
  x,
  y,
  width,
  height,
}) => {
  const frame = useCurrentFrame()

  // The mask is always rendered at full opacity.
  // It lives inside the settings image wrapper which has opacity: 0 before the crossfade,
  // so the mask is naturally invisible during the dropdown phase.
  // No fade needed — the wrapper's own opacity + blur handle the transition.
  const _maskStartFrame = maskStartFrame // keep prop for interface stability

  // Typing progress (only starts at typeStartFrame, not maskStartFrame)
  const typingDuration = typeEndFrame - typeStartFrame
  const charsPerFrame = DESCRIPTION_TEXT.length / typingDuration
  const elapsed = Math.max(0, frame - typeStartFrame)
  // Before typeStartFrame, no chars typed yet
  const typingActive = frame >= typeStartFrame
  const totalCharsTyped = typingActive
    ? Math.min(DESCRIPTION_TEXT.length, Math.floor(elapsed * charsPerFrame))
    : 0
  const displayedText = DESCRIPTION_TEXT.slice(0, totalCharsTyped)
  const isTyping = typingActive && totalCharsTyped < DESCRIPTION_TEXT.length

  // Blinking cursor (only shows once typing has started)
  const cursorOpacity = isTyping
    ? interpolate(frame % 16, [0, 8, 16], [1, 0, 1])
    : 0

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        opacity: 1,
        zIndex: 50,
        background: colors.surface.white,
      }}
    >
      <div
        style={{
          padding: '3px 4px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 11,
          lineHeight: 1.4,
          color: colors.text.secondary,
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
      >
        {displayedText}
        <span
          style={{
            display: 'inline-block',
            width: 1,
            height: 10,
            background: colors.text.primary,
            opacity: cursorOpacity,
            marginLeft: 1,
            verticalAlign: 'text-bottom',
          }}
        />
      </div>
    </div>
  )
}
