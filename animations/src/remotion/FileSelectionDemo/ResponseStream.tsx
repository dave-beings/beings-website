import { useCurrentFrame, interpolate } from 'remotion'
import { colors, fonts } from '../../components/marketing/design-tokens'

interface ResponseStreamProps {
  /** Frame when streaming starts */
  streamStartFrame: number
  /** Frame when streaming ends */
  streamEndFrame: number
  /** Frame when overlay fades out (loop fade) */
  fadeOutFrame: number
  /** Left edge in card-relative pixels */
  x: number
  /** Top edge in card-relative pixels */
  y: number
  /** Width of the response area */
  width: number
  /** Height of the white mask covering the screenshot response */
  maskHeight: number
}

const RESPONSE_TEXT =
  'The interviews highlight three key themes for improving patient experience:\n\n1. Clarity and Accessibility of Information\n\nParticipants frequently mentioned the importance of clear explanations about the study, its purpose, and what was expected of them. Feedback indicates a need for simpler language, potentially avoiding medical jargon, and providing materials in various formats, including written and face-to-face explanations. Some participants found explanations too fast or paperwork difficult to follow, suggesting that pacing and format diversity are crucial for ensuring comprehensive understanding across diverse participant groups.'

export const ResponseStream: React.FC<ResponseStreamProps> = ({
  streamStartFrame,
  streamEndFrame,
  fadeOutFrame,
  x,
  y,
  width,
  maskHeight,
}) => {
  const frame = useCurrentFrame()

  // Not visible before streaming starts
  if (frame < streamStartFrame) return null

  // Fade out
  const fadeOut = interpolate(frame, [fadeOutFrame, fadeOutFrame + 20], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  if (fadeOut <= 0) return null

  // Streaming progress — characters typed
  const streamDuration = streamEndFrame - streamStartFrame
  const charsPerFrame = RESPONSE_TEXT.length / streamDuration
  const elapsed = Math.max(0, frame - streamStartFrame)
  const totalCharsTyped = Math.min(
    RESPONSE_TEXT.length,
    Math.floor(elapsed * charsPerFrame)
  )
  const displayedText = RESPONSE_TEXT.slice(0, totalCharsTyped)

  // Blinking cursor at end of streamed text
  const isStreaming = totalCharsTyped < RESPONSE_TEXT.length
  const cursorOpacity = isStreaming
    ? interpolate(frame % 12, [0, 6, 12], [1, 0, 1])
    : 0

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height: maskHeight,
        overflow: 'hidden',
        opacity: fadeOut,
      }}
    >
      {/* "Aida" label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          marginBottom: 4,
          paddingTop: 2,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: colors.surface.gray200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 5,
            color: colors.text.secondary,
          }}
        >
          &#10024;
        </div>
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: 5.5,
            fontWeight: 500,
            color: colors.text.secondary,
          }}
        >
          Aida
        </span>
      </div>

      {/* Streamed response text */}
      <div
        style={{
          fontFamily: fonts.sans,
          fontSize: 6.5,
          lineHeight: 1.55,
          color: colors.text.primary,
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        }}
      >
        {displayedText}
        {isStreaming && (
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
        )}
      </div>
    </div>
  )
}
