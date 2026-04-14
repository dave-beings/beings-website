import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion'
import { colors, fonts, radius } from '../../components/marketing/design-tokens'

interface ActionBarProps {
  appearFrame: number
}

const BUTTONS = ['Summarise', 'Discuss', 'Evaluate']
const STAGGER_FRAMES = 3

export const ActionBar: React.FC<ActionBarProps> = ({ appearFrame }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Overall bar slide-up
  const barProgress = spring({
    frame: frame - appearFrame,
    fps,
    config: { damping: 200 },
  })
  const barTranslateY = interpolate(barProgress, [0, 1], [20, 0])
  const barOpacity = interpolate(barProgress, [0, 1], [0, 1])

  if (frame < appearFrame - 5) return null

  return (
    <div
      style={{
        flexShrink: 0,
        padding: '10px 16px',
        borderTop: `1px solid ${colors.surface.gray200}`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        opacity: barOpacity,
        transform: `translateY(${barTranslateY}px)`,
      }}
    >
      {/* Blue "+" FAB */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: colors.brand.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ color: '#fff', fontSize: 18, fontWeight: 300, lineHeight: 1 }}>+</span>
      </div>

      {/* Action buttons with staggered entrance */}
      <div style={{ display: 'flex', gap: 8 }}>
        {BUTTONS.map((label, i) => {
          const btnProgress = spring({
            frame: frame - (appearFrame + i * STAGGER_FRAMES),
            fps,
            config: { damping: 20, stiffness: 200 },
          })
          const btnScale = interpolate(btnProgress, [0, 1], [0.8, 1])
          const btnOpacity = interpolate(btnProgress, [0, 1], [0, 1])

          return (
            <div
              key={label}
              style={{
                fontFamily: fonts.sans,
                fontSize: 11,
                fontWeight: 500,
                color: colors.text.secondary,
                padding: '6px 14px',
                borderRadius: radius.full,
                border: `1px solid ${colors.surface.gray200}`,
                background: colors.surface.white,
                opacity: btnOpacity,
                transform: `scale(${btnScale})`,
              }}
            >
              {label}
            </div>
          )
        })}
      </div>
    </div>
  )
}
