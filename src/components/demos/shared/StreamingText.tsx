import { lerp } from './useAnimationLoop'

interface StreamingTextProps {
  /** Current loop time in seconds */
  time: number
  /** Text to stream */
  text: string
  /** When streaming starts (seconds) */
  startTime: number
  /** When streaming ends (seconds) */
  endTime: number
  /** When overlay fades out (seconds) */
  fadeOutTime: number
  /** Position in composition-space pixels */
  x: number
  y: number
  width: number
  /** Height of the masked area */
  maskHeight: number
  /** Label shown above the response (e.g. "Aida") */
  label?: string
}

const FADE_OUT_DURATION = 0.67 // 20 frames
const BLINK_PERIOD = 0.4       // 12 frames @ 30fps

export function StreamingText({
  time,
  text,
  startTime,
  endTime,
  fadeOutTime,
  x,
  y,
  width,
  maskHeight,
  label = 'Aida',
}: StreamingTextProps) {
  if (time < startTime) return null

  const fadeOut = lerp(time, fadeOutTime, fadeOutTime + FADE_OUT_DURATION, 1, 0)
  if (fadeOut <= 0) return null

  const elapsed = Math.max(0, time - startTime)
  const duration = endTime - startTime
  const progress = Math.min(1, elapsed / duration)
  const totalChars = Math.floor(progress * text.length)
  const displayedText = text.slice(0, totalChars)
  const isStreaming = totalChars < text.length

  const caretPhase = (time % BLINK_PERIOD) / BLINK_PERIOD
  const caretOpacity = isStreaming ? (caretPhase < 0.5 ? 1 : 0) : 0

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
      {/* Label */}
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
            background: 'var(--color-divider)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 5,
            color: 'var(--color-text-secondary)',
          }}
        >
          &#10024;
        </div>
        <span
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 5.5,
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
          }}
        >
          {label}
        </span>
      </div>

      {/* Streamed text */}
      <div
        style={{
          fontFamily: 'var(--font-family)',
          fontSize: 6.5,
          lineHeight: 1.55,
          color: 'var(--color-text-primary)',
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
              background: 'var(--color-text-primary)',
              opacity: caretOpacity,
              marginLeft: 1,
              verticalAlign: 'text-bottom',
            }}
          />
        )}
      </div>
    </div>
  )
}
