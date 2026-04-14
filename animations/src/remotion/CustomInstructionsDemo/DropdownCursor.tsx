import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion'
import { colors } from '../../components/marketing/design-tokens'

interface Waypoint {
  frame: number
  x: number
  y: number
  click?: boolean
}

interface DropdownCursorProps {
  enterFrame: number
  exitFrame: number
  waypoints: Waypoint[]
}

/**
 * Multi-waypoint cursor: enters, moves through waypoints (optionally clicking),
 * then fades out. Uses interpolate() for deterministic positioning.
 */
export const DropdownCursor: React.FC<DropdownCursorProps> = ({
  enterFrame,
  exitFrame,
  waypoints,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Entrance fade
  const enterOpacity = interpolate(frame, [enterFrame, enterFrame + 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Exit fade
  const exitOpacity = interpolate(frame, [exitFrame, exitFrame + 15], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const opacity = Math.min(enterOpacity, exitOpacity)
  if (opacity <= 0) return null

  // Starting position (offset from first waypoint)
  const startX = waypoints[0].x + 140
  const startY = waypoints[0].y + 110

  // Move from start to first waypoint (spring for natural entrance)
  const firstMoveProgress = spring({
    frame: frame - enterFrame,
    fps,
    config: { damping: 200 },
    durationInFrames: waypoints[0].frame - enterFrame,
  })
  let cursorX = interpolate(firstMoveProgress, [0, 1], [startX, waypoints[0].x])
  let cursorY = interpolate(firstMoveProgress, [0, 1], [startY, waypoints[0].y])

  // Move between consecutive waypoints using interpolate (deterministic)
  for (let i = 1; i < waypoints.length; i++) {
    const prev = waypoints[i - 1]
    const curr = waypoints[i]
    if (frame >= prev.frame) {
      const progress = interpolate(
        frame,
        [prev.frame, curr.frame],
        [0, 1],
        {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.inOut(Easing.quad),
        }
      )
      cursorX = interpolate(progress, [0, 1], [prev.x, curr.x])
      cursorY = interpolate(progress, [0, 1], [prev.y, curr.y])
    }
  }

  // Find active click (if cursor is at a click waypoint)
  let clickScale = 1
  let rippleOpacity = 0
  let rippleScale = 0

  for (const wp of waypoints) {
    if (wp.click && frame >= wp.frame) {
      const clickProgress = spring({
        frame: frame - wp.frame,
        fps,
        config: { damping: 20, stiffness: 200 },
      })
      clickScale = interpolate(clickProgress, [0, 0.5, 1], [1, 0.8, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
      rippleOpacity = interpolate(frame - wp.frame, [0, 15], [0.6, 0], {
        extrapolateRight: 'clamp',
      })
      rippleScale = interpolate(frame - wp.frame, [0, 15], [0, 2.5], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.quad),
      })
    }
  }

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
