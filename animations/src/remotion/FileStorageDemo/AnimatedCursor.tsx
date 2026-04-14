import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion'
import { colors } from '../../components/marketing/design-tokens'

interface AnimatedCursorProps {
  /** Frame when cursor begins entering */
  enterFrame: number
  /** Frame when cursor "clicks" */
  clickFrame: number
  /** Frame when cursor starts exiting */
  exitFrame: number
  /** Target position {x, y} in composition-space pixels */
  targetX: number
  targetY: number
}

export const AnimatedCursor: React.FC<AnimatedCursorProps> = ({
  enterFrame,
  clickFrame,
  exitFrame,
  targetX,
  targetY,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Cursor start position (off-screen bottom-right)
  const startX = targetX + 180
  const startY = targetY + 140

  // Phase 1: Move from start to target
  const moveProgress = spring({
    frame: frame - enterFrame,
    fps,
    config: { damping: 200 },
    durationInFrames: clickFrame - enterFrame,
  })

  const cursorX = interpolate(moveProgress, [0, 1], [startX, targetX])
  const cursorY = interpolate(moveProgress, [0, 1], [startY, targetY])

  // Phase 2: Click pulse — scale down then back up
  const clickProgress = spring({
    frame: frame - clickFrame,
    fps,
    config: { damping: 20, stiffness: 200 },
  })
  const clickScale = frame >= clickFrame
    ? interpolate(clickProgress, [0, 0.5, 1], [1, 0.8, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1

  // Click ripple effect
  const rippleOpacity = frame >= clickFrame
    ? interpolate(frame - clickFrame, [0, 15], [0.6, 0], {
        extrapolateRight: 'clamp',
      })
    : 0
  const rippleScale = frame >= clickFrame
    ? interpolate(frame - clickFrame, [0, 15], [0, 2.5], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.quad),
      })
    : 0

  // Phase 3: Fade out
  const exitOpacity = interpolate(frame, [exitFrame, exitFrame + 20], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Overall visibility — invisible before enter
  const enterOpacity = interpolate(frame, [enterFrame, enterFrame + 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const opacity = Math.min(enterOpacity, exitOpacity)

  if (opacity <= 0) return null

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
      {/* Click ripple */}
      {rippleOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 3,
            top: 1,
            width: 12,
            height: 12,
            borderRadius: '50%',
            border: `2px solid ${colors.brand.primary}`,
            opacity: rippleOpacity,
            transform: `scale(${rippleScale})`,
            transformOrigin: 'center',
          }}
        />
      )}
      {/* Cursor SVG */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{ filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.25))' }}
      >
        <path
          d="M5 3L19 12L12 13L9 20L5 3Z"
          fill="#FFFFFF"
          stroke="#101A29"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
