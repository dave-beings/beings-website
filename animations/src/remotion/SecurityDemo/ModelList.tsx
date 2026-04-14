import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { colors, fonts } from '../../components/marketing/design-tokens'

interface ModelListProps {
  /** Frame when the list becomes visible */
  revealFrame: number
  /** Frame when scroll animation starts */
  scrollStartFrame: number
  /** Frame when scroll animation ends */
  scrollEndFrame: number
}

const MODELS = [
  { name: 'Mistral Large 2', desc: 'GDPR-compliant analysis' },
  { name: 'o1 (Reasoner)', desc: 'Chain-of-thought specialist' },
  { name: 'Claude Sonnet 4', desc: 'Legacy Analyst' },
  { name: 'Claude Sonnet 3.7 (Budget)', desc: 'Budget analyst option' },
  { name: 'Claude 3.5 Haiku (Clerk)', desc: 'Legacy Clerk' },
  { name: 'GPT-4o', desc: 'General purpose' },
  { name: 'Gemini 1.5 Pro', desc: 'Long context specialist' },
  { name: 'Llama 3.1 70B', desc: 'Open-weight analyst' },
]

export const ModelList: React.FC<ModelListProps> = ({
  revealFrame,
  scrollStartFrame,
  scrollEndFrame,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Reveal: opacity spring
  const revealProgress = spring({
    frame: frame - revealFrame,
    fps,
    config: { damping: 200 },
    durationInFrames: 15,
  })
  const revealOpacity = interpolate(revealProgress, [0, 1], [0, 1])

  // Scroll: spring-driven translateY
  const scrollProgress = spring({
    frame: frame - scrollStartFrame,
    fps,
    config: { damping: 200 },
    durationInFrames: scrollEndFrame - scrollStartFrame,
  })
  const scrollY = interpolate(scrollProgress, [0, 1], [0, -130])

  if (revealOpacity <= 0) return null

  return (
    <div
      style={{
        opacity: revealOpacity,
        height: 180,
        overflow: 'hidden',
        borderTop: `1px solid ${colors.surface.gray200}`,
        marginTop: 4,
      }}
    >
      <div style={{ transform: `translateY(${scrollY}px)` }}>
        {MODELS.map((model, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '7px 4px',
              borderBottom: i < MODELS.length - 1 ? `1px solid ${colors.surface.gray100}` : 'none',
            }}
          >
            {/* Red radio dot (unfilled) */}
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: '2px solid #EF4444',
                flexShrink: 0,
              }}
            />

            {/* Model name + description */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: colors.text.primary,
                  fontFamily: fonts.sans,
                }}
              >
                {model.name}
              </div>
              <div
                style={{
                  fontSize: 9.5,
                  color: colors.text.muted,
                  fontFamily: fonts.sans,
                }}
              >
                {model.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
