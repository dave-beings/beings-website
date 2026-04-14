import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion'
import { colors } from '../../components/marketing/design-tokens'

interface CursorTarget {
  /** Target position X in composition-space pixels */
  targetX: number
  /** Target position Y in composition-space pixels */
  targetY: number
  /** Frame when cursor begins moving toward this target */
  enterFrame: number
  /** Frame when cursor "clicks" on this target */
  clickFrame: number
  /** Frame when cursor starts exiting / moving to next target */
  exitFrame: number
}

interface AnimatedCursorProps {
  targets: CursorTarget[]
}

export const AnimatedCursor: React.FC<AnimatedCursorProps> = ({ targets }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  if (targets.length === 0) return null

  // Find which target is currently active
  const firstEnter = targets[0].enterFrame
  const lastExit = targets[targets.length - 1].exitFrame

  // Overall visibility
  const enterOpacity = interpolate(frame, [firstEnter, firstEnter + 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const exitOpacity = interpolate(frame, [lastExit, lastExit + 20], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const opacity = Math.min(enterOpacity, exitOpacity)

  if (opacity <= 0) return null

  // Compute cursor position by interpolating through all targets
  let cursorX = targets[0].targetX + 180
  let cursorY = targets[0].targetY + 140

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i]
    const prevX = i === 0 ? t.targetX + 180 : targets[i - 1].targetX
    const prevY = i === 0 ? t.targetY + 140 : targets[i - 1].targetY

    const moveProgress = spring({
      frame: frame - t.enterFrame,
      fps,
      config: { damping: 200 },
      durationInFrames: t.clickFrame - t.enterFrame,
    })

    if (frame >= t.enterFrame) {
      cursorX = interpolate(moveProgress, [0, 1], [prevX, t.targetX])
      cursorY = interpolate(moveProgress, [0, 1], [prevY, t.targetY])
    }
  }

  // Find active click (the most recent click that has occurred)
  let activeClick: CursorTarget | null = null
  for (const t of targets) {
    if (frame >= t.clickFrame && frame < t.clickFrame + 20) {
      activeClick = t
    }
  }

  // Click pulse
  const clickScale = activeClick
    ? (() => {
        const p = spring({
          frame: frame - activeClick.clickFrame,
          fps,
          config: { damping: 20, stiffness: 200 },
        })
        return interpolate(p, [0, 0.5, 1], [1, 0.8, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      })()
    : 1

  // Click ripple
  const rippleOpacity = activeClick
    ? interpolate(frame - activeClick.clickFrame, [0, 15], [0.6, 0], {
        extrapolateRight: 'clamp',
        extrapolateLeft: 'clamp',
      })
    : 0
  const rippleScale = activeClick
    ? interpolate(frame - activeClick.clickFrame, [0, 15], [0, 2.5], {
        extrapolateRight: 'clamp',
        extrapolateLeft: 'clamp',
        easing: Easing.out(Easing.quad),
      })
    : 0

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
