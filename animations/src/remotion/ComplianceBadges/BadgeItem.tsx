import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { colors, fonts } from '../../components/marketing/design-tokens'

interface BadgeItemProps {
  label: string
  startFrame: number
  icon?: React.ReactNode
  imageSrc?: string
}

const CHARS_PER_FRAME = 3
const TYPE_START_OFFSET = 14
const BLINK_FRAMES = 14

export const BadgeItem: React.FC<BadgeItemProps> = ({ label, startFrame, icon, imageSrc }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const popProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 12, stiffness: 280 },
    durationInFrames: 18,
  })
  const scale = interpolate(popProgress, [0, 1], [0.3, 1])
  const opacity = interpolate(popProgress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Typewriter
  const typeStartFrame = startFrame + TYPE_START_OFFSET
  const typeElapsed = Math.max(0, frame - typeStartFrame)
  const totalCharsTyped = Math.min(label.length, Math.floor(typeElapsed * CHARS_PER_FRAME))
  const typedText = label.slice(0, totalCharsTyped)
  const isTypingDone = totalCharsTyped >= label.length

  // Blinking cursor during typing
  const showCursor = frame >= typeStartFrame && !isTypingDone
  const cursorOpacity = interpolate(
    frame % BLINK_FRAMES,
    [0, BLINK_FRAMES / 2, BLINK_FRAMES],
    [1, 0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )

  // Checkmark dot springs in after typing completes
  const doneFrame = typeStartFrame + Math.ceil(label.length / CHARS_PER_FRAME)
  const checkProgress = spring({
    frame: frame - doneFrame,
    fps,
    config: { damping: 10, stiffness: 450 },
    durationInFrames: 14,
  })
  const checkScale = interpolate(checkProgress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Glow on icon circle after done
  const glowOpacity = interpolate(checkProgress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  if (frame < startFrame) return null

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        transform: `scale(${scale})`,
        opacity,
        width: '100%',
      }}
    >
      {/* Icon circle with checkmark dot */}
      <div style={{ position: 'relative' }}>
        {imageSrc ? (
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: `0 2px 8px rgba(0, 0, 0, ${0.08 + 0.06 * glowOpacity}), 0 1px 3px rgba(0, 0, 0, 0.06)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1.5px solid ${colors.surface.gray200}`,
              overflow: 'hidden',
              padding: 4,
            }}
          >
            <img
              src={imageSrc}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '50%',
              }}
            />
          </div>
        ) : (
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: `linear-gradient(140deg, ${colors.brand.primaryLight} 0%, ${colors.brand.primaryDark} 100%)`,
              boxShadow: `0 4px 12px rgba(4, 156, 240, ${0.3 + 0.25 * glowOpacity}), 0 2px 4px rgba(4, 156, 240, 0.2)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1.5px solid rgba(255,255,255,0.2)`,
            }}
          >
            {icon}
          </div>
        )}

        {/* Green checkmark dot — springs in on typing complete */}
        {checkScale > 0.01 && (
          <div
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              width: 17,
              height: 17,
              borderRadius: '50%',
              background: '#22C55E',
              border: `2px solid ${colors.surface.white}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${checkScale})`,
              transformOrigin: 'center center',
            }}
          >
            <span
              style={{
                color: '#fff',
                fontSize: 8,
                fontWeight: 800,
                lineHeight: 1,
                fontFamily: fonts.sans,
              }}
            >
              ✓
            </span>
          </div>
        )}
      </div>

      {/* Label with typewriter reveal */}
      <div
        style={{
          fontFamily: fonts.sans,
          fontSize: 9.5,
          fontWeight: 500,
          color: colors.text.primary,
          textAlign: 'center',
          lineHeight: 1.35,
          maxWidth: 86,
          minHeight: 24,
        }}
      >
        {typedText}
        {showCursor && (
          <span
            style={{
              opacity: cursorOpacity,
              color: colors.brand.primary,
              fontWeight: 300,
              marginLeft: 1,
            }}
          >
            |
          </span>
        )}
      </div>
    </div>
  )
}
