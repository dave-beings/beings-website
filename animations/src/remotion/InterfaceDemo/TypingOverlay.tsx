import { useCurrentFrame, interpolate } from 'remotion'
import { colors, fonts } from '../../components/marketing/design-tokens'

interface TypingOverlayProps {
  /** Frame when typing starts */
  typeStartFrame: number
  /** Frame when typing ends */
  typeEndFrame: number
  /** Frame when overlay fades out (during crossfade transition) */
  fadeOutFrame: number
  /** Left edge in composition-space pixels */
  x: number
  /** Top edge — sits in the text input strip below the divider */
  y: number
  /** Width of the input field */
  width: number
}

const PROMPT_TEXT =
  'Summarise the three most prominent themes in these interviews through the lens of what feedback we need to most note in order to ultimately make the patient experience better'

export const TypingOverlay: React.FC<TypingOverlayProps> = ({
  typeStartFrame,
  typeEndFrame,
  fadeOutFrame,
  x,
  y,
  width,
}) => {
  const frame = useCurrentFrame()

  // Not visible before typing starts
  if (frame < typeStartFrame) return null

  // Fade out during crossfade
  const fadeOutOpacity = interpolate(frame, [fadeOutFrame, fadeOutFrame + 20], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  if (fadeOutOpacity <= 0) return null

  // Entrance opacity (quick fade in at start)
  const entranceOpacity = interpolate(frame - typeStartFrame, [0, 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Typing progress
  const typingDuration = typeEndFrame - typeStartFrame
  const charsPerFrame = PROMPT_TEXT.length / typingDuration
  const elapsed = Math.max(0, frame - typeStartFrame)
  const totalCharsTyped = Math.min(
    PROMPT_TEXT.length,
    Math.floor(elapsed * charsPerFrame)
  )
  const displayedText = PROMPT_TEXT.slice(0, totalCharsTyped)
  const isTyping = totalCharsTyped < PROMPT_TEXT.length

  // Blinking cursor (only while typing)
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
        opacity: Math.min(entranceOpacity, fadeOutOpacity),
        zIndex: 50,
      }}
    >
      <div
        style={{
          padding: '0 2px',
          fontFamily: fonts.sans,
          fontSize: 8,
          lineHeight: 1.5,
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
            height: 7,
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
