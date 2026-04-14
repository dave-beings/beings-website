import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { colors, fonts, shadows } from '../../components/marketing/design-tokens'

interface WarningDialogProps {
  /** Frame when dialog appears */
  enterFrame: number
  /** First bullet frame — subsequent bullets stagger by bulletGap */
  bulletStartFrame: number
  /** Gap between each bullet reveal */
  bulletGap: number
  /** Frame when dialog starts fading out */
  exitStartFrame: number
  /** Frame when dialog is fully gone */
  exitEndFrame: number
}

const WARNING_BULLETS = [
  'Data may be processed outside UK/EU',
  'PII should be redacted before sending',
  'Use for non-sensitive content only',
]

export const WarningDialog: React.FC<WarningDialogProps> = ({
  enterFrame,
  bulletStartFrame,
  bulletGap,
  exitStartFrame,
  exitEndFrame,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Entrance: scale + opacity spring
  const entranceProgress = spring({
    frame: frame - enterFrame,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  })
  const entranceScale = interpolate(entranceProgress, [0, 1], [0.95, 1])
  const entranceOpacity = interpolate(entranceProgress, [0, 1], [0, 1])

  // Exit: opacity fade
  const exitOpacity = interpolate(frame, [exitStartFrame, exitEndFrame], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const opacity = Math.min(entranceOpacity, exitOpacity)

  if (opacity <= 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.7)',
        opacity,
        zIndex: 50,
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        style={{
          width: '85%',
          maxWidth: 380,
          background: colors.surface.white,
          borderRadius: 12,
          boxShadow: shadows.elevated,
          padding: '20px 22px',
          transform: `scale(${entranceScale})`,
          fontFamily: fonts.sans,
          border: `1px solid ${colors.surface.gray200}`,
        }}
      >
        {/* Red circle icon + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(239,68,68,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: '#EF4444',
              }}
            />
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: colors.text.primary,
            }}
          >
            Send to Global Cloud?
          </span>
        </div>

        {/* Body text */}
        <div
          style={{
            fontSize: 11,
            lineHeight: 1.5,
            color: colors.text.secondary,
            marginBottom: 14,
            paddingLeft: 42,
          }}
        >
          Your data will be processed by AI models in US or global data centers. Consider redacting
          sensitive information.
        </div>

        {/* Warning box with bullets */}
        <div
          style={{
            background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.18)',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 16,
          }}
        >
          {/* Warning icon + bullets */}
          <div style={{ display: 'flex', gap: 8 }}>
            {/* Warning triangle icon */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              style={{ flexShrink: 0, marginTop: 1 }}
            >
              <path
                d="M8 1.5L14.5 13H1.5L8 1.5Z"
                fill="#F59E0B"
                stroke="#D97706"
                strokeWidth="0.5"
              />
              <text
                x="8"
                y="11.5"
                textAnchor="middle"
                fill="white"
                fontSize="9"
                fontWeight="bold"
              >
                !
              </text>
            </svg>
            <div style={{ flex: 1 }}>
              {WARNING_BULLETS.map((bullet, i) => {
                const bulletFrame = bulletStartFrame + i * bulletGap
                const bulletProgress = spring({
                  frame: frame - bulletFrame,
                  fps,
                  config: { damping: 200 },
                  durationInFrames: 12,
                })
                const bulletOpacity = interpolate(bulletProgress, [0, 1], [0, 1])
                const bulletY = interpolate(bulletProgress, [0, 1], [6, 0])

                return (
                  <div
                    key={i}
                    style={{
                      fontSize: 10,
                      color: '#92400E',
                      lineHeight: 1.6,
                      opacity: bulletOpacity,
                      transform: `translateY(${bulletY}px)`,
                      fontFamily: fonts.sans,
                    }}
                  >
                    {'\u2022'} {bullet}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: colors.text.secondary,
              padding: '6px 20px',
              borderRadius: 8,
              border: `1px solid ${colors.surface.gray200}`,
              fontFamily: fonts.sans,
              cursor: 'pointer',
            }}
          >
            Cancel
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'white',
              padding: '6px 20px',
              borderRadius: 8,
              background: '#EF4444',
              fontFamily: fonts.sans,
              cursor: 'pointer',
            }}
          >
            Continue
          </div>
        </div>

        {/* Don't ask again */}
        <div
          style={{
            textAlign: 'center',
            fontSize: 9.5,
            color: colors.text.muted,
            marginTop: 10,
            fontFamily: fonts.sans,
          }}
        >
          Don{'\u2019'}t ask again this session
        </div>
      </div>
    </div>
  )
}
