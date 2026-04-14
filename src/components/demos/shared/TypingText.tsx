import { lerp } from './useAnimationLoop'

interface TypingTextProps {
  /** Current loop time in seconds */
  time: number
  /** Text to type out */
  text: string
  /** When typing starts (seconds) */
  startTime: number
  /** When typing ends (seconds) */
  endTime: number
  /** When overlay fades out (seconds) */
  fadeOutTime: number
  /** Position in composition-space pixels */
  x: number
  y: number
  width: number
}

const FADE_IN_DURATION = 0.2   // 6 frames @ 30fps
const FADE_OUT_DURATION = 0.67 // 20 frames
const BLINK_PERIOD = 0.53      // 16 frames @ 30fps

export function TypingText({
  time,
  text,
  startTime,
  endTime,
  fadeOutTime,
  x,
  y,
  width,
}: TypingTextProps) {
  if (time < startTime) return null

  const fadeOutOpacity = lerp(time, fadeOutTime, fadeOutTime + FADE_OUT_DURATION, 1, 0)
  if (fadeOutOpacity <= 0) return null

  const entranceOpacity = lerp(time, startTime, startTime + FADE_IN_DURATION, 0, 1)
  const opacity = Math.min(entranceOpacity, fadeOutOpacity)

  const elapsed = Math.max(0, time - startTime)
  const duration = endTime - startTime
  const progress = Math.min(1, elapsed / duration)
  const totalChars = Math.floor(progress * text.length)
  const displayedText = text.slice(0, totalChars)
  const isTyping = totalChars < text.length

  // Blinking caret
  const caretPhase = (time % BLINK_PERIOD) / BLINK_PERIOD
  const caretOpacity = isTyping ? (caretPhase < 0.5 ? 1 : 0) : 0

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        opacity,
        zIndex: 50,
      }}
    >
      <div
        style={{
          padding: '0 2px',
          fontFamily: 'var(--font-family)',
          fontSize: 8,
          lineHeight: 1.5,
          color: 'var(--color-text-secondary)',
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
            background: 'var(--color-text-primary)',
            opacity: caretOpacity,
            marginLeft: 1,
            verticalAlign: 'text-bottom',
          }}
        />
      </div>
    </div>
  )
}
