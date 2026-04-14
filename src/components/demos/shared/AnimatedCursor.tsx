import { useMemo } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { lerp } from './useAnimationLoop'

interface AnimatedCursorProps {
  /** Current loop time in seconds */
  time: number
  /** When cursor begins entering (seconds) */
  enterTime: number
  /** When cursor "clicks" (seconds) */
  clickTime: number
  /** When cursor starts exiting (seconds) */
  exitTime: number
  /** Target position in composition-space pixels */
  targetX: number
  targetY: number
}

const CURSOR_PATH = 'M5 3L19 12L12 13L9 20L5 3Z'
const OFFSET_X = 180
const OFFSET_Y = 140
const FADE_IN_DURATION = 0.27   // 8 frames @ 30fps
const FADE_OUT_DURATION = 0.67  // 20 frames
const RIPPLE_DURATION = 0.5     // 15 frames

export function AnimatedCursor({
  time,
  enterTime,
  clickTime,
  exitTime,
  targetX,
  targetY,
}: AnimatedCursorProps) {
  const startX = targetX + OFFSET_X
  const startY = targetY + OFFSET_Y

  const enterOpacity = lerp(time, enterTime, enterTime + FADE_IN_DURATION, 0, 1)
  const exitOpacity = lerp(time, exitTime, exitTime + FADE_OUT_DURATION, 1, 0)
  const opacity = Math.min(enterOpacity, exitOpacity)

  if (opacity <= 0) return null

  const moveDuration = clickTime - enterTime
  const moveProgress = Math.max(0, Math.min(1, (time - enterTime) / moveDuration))
  // Overdamped spring approximation: fast deceleration
  const eased = 1 - Math.pow(1 - moveProgress, 3)

  const cursorX = startX + (targetX - startX) * eased
  const cursorY = startY + (targetY - startY) * eased

  // Click pulse
  const timeSinceClick = time - clickTime
  let clickScale = 1
  if (timeSinceClick >= 0 && timeSinceClick < 0.3) {
    const p = timeSinceClick / 0.3
    clickScale = p < 0.5 ? lerp(p, 0, 0.5, 1, 0.8) : lerp(p, 0.5, 1, 0.8, 1)
  }

  // Click ripple
  const rippleActive = timeSinceClick >= 0 && timeSinceClick < RIPPLE_DURATION
  const rippleOpacity = rippleActive ? lerp(timeSinceClick, 0, RIPPLE_DURATION, 0.6, 0) : 0
  const rippleScale = rippleActive ? lerp(timeSinceClick, 0, RIPPLE_DURATION, 0, 2.5) : 0

  return (
    <div
      style={{
        position: 'absolute',
        left: cursorX,
        top: cursorY,
        opacity,
        transform: `scale(${clickScale})`,
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      {rippleOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 3,
            top: 1,
            width: 12,
            height: 12,
            borderRadius: '50%',
            border: '2px solid var(--color-primary)',
            opacity: rippleOpacity,
            transform: `scale(${rippleScale})`,
            transformOrigin: 'center',
          }}
        />
      )}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{ filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.25))' }}
      >
        <path
          d={CURSOR_PATH}
          fill="#FFFFFF"
          stroke="var(--color-text-primary)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
