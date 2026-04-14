import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { colors, fonts, radius } from '../../components/marketing/design-tokens'

const AGENT_OPTIONS = [
  { name: 'Aida \u2014 AI Analyst', selected: true },
  { name: 'The Architect \u2014 Prompt Engineer', selected: false },
  { name: 'Deep Researcher \u2014 Research Analyst', selected: false },
]

interface IdentityPanelProps {
  enterFrame: number
  dropdownOpenFrame: number
  /** Frames when cursor hovers each option (length must match AGENT_OPTIONS) */
  hoverFrames?: number[]
}

export const IdentityPanel: React.FC<IdentityPanelProps> = ({
  enterFrame,
  dropdownOpenFrame,
  hoverFrames,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Panel entrance opacity
  const enterOpacity = interpolate(frame, [enterFrame, enterFrame + 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const enterSlide = interpolate(frame, [enterFrame, enterFrame + 15], [12, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Dropdown open animation
  const dropdownProgress = spring({
    frame: frame - dropdownOpenFrame,
    fps,
    config: { damping: 20, stiffness: 120 },
  })
  const dropdownHeight = frame >= dropdownOpenFrame
    ? interpolate(dropdownProgress, [0, 1], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0

  // Compute which option is currently hovered
  const getHoverIntensity = (index: number): number => {
    if (!hoverFrames || !hoverFrames[index]) return 0
    const hoverStart = hoverFrames[index]
    // Next hover frame (or +30 if last option)
    const hoverEnd = index < hoverFrames.length - 1
      ? hoverFrames[index + 1]
      : hoverStart + 30

    // Fade in over 6 frames, hold, fade out over 6 frames
    const fadeIn = interpolate(frame, [hoverStart, hoverStart + 6], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
    const fadeOut = interpolate(frame, [hoverEnd - 6, hoverEnd], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
    return Math.min(fadeIn, fadeOut)
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: '28px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        opacity: enterOpacity,
        transform: `translateY(${enterSlide}px)`,
        fontFamily: fonts.sans,
      }}
    >
      {/* Header: Settings + X */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: colors.text.primary,
            letterSpacing: '-0.01em',
          }}
        >
          Settings
        </div>
        {/* X close button */}
        <div
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 1L13 13M13 1L1 13"
              stroke={colors.text.secondary}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Section label */}
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 600,
          color: colors.text.muted,
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
        }}
      >
        Identity Template
      </div>

      {/* Dropdown container */}
      <div style={{ position: 'relative' }}>
        {/* Closed dropdown (select-like) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            border: `1px solid ${colors.surface.gray200}`,
            borderRadius: radius.md,
            background: colors.surface.white,
            fontSize: 13,
            fontWeight: 500,
            color: colors.text.primary,
          }}
        >
          Aida {'\u2014'} AI Analyst
          {/* Chevron */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke={colors.text.secondary}
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Expanded dropdown options — overlays below the select */}
        {dropdownHeight > 0.01 && (
          <div
            style={{
              position: 'absolute',
              top: 42,
              left: 0,
              right: 0,
              zIndex: 10,
              background: colors.surface.white,
              border: `1px solid ${colors.surface.gray200}`,
              borderRadius: radius.md,
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              transform: `scaleY(${dropdownHeight})`,
              transformOrigin: 'top',
              opacity: dropdownHeight,
            }}
          >
            {AGENT_OPTIONS.map((agent, i) => {
              // Staggered reveal per option
              const optionDelay = dropdownOpenFrame + 5 + i * 5
              const optionOpacity = interpolate(frame, [optionDelay, optionDelay + 8], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })
              const optionSlide = interpolate(frame, [optionDelay, optionDelay + 8], [8, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })

              // Hover highlight
              const hoverIntensity = getHoverIntensity(i)
              const hoverBg = hoverIntensity > 0
                ? `rgba(4, 156, 240, ${0.06 * hoverIntensity})`
                : 'transparent'

              return (
                <div
                  key={agent.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    fontSize: 13,
                    fontWeight: agent.selected ? 500 : 400,
                    color: colors.text.primary,
                    opacity: optionOpacity,
                    transform: `translateY(${optionSlide}px)`,
                    borderBottom: i < AGENT_OPTIONS.length - 1 ? `1px solid ${colors.surface.gray100}` : 'none',
                    background: hoverBg,
                    transition: 'none',
                  }}
                >
                  {/* Checkmark for selected */}
                  {agent.selected && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2.5 7L5.5 10L11.5 4"
                        stroke={colors.brand.primary}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {!agent.selected && <div style={{ width: 14 }} />}
                  {agent.name}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Subtext — outside the dropdown container so it doesn't affect top:100% */}
      <div style={{ fontSize: 11, color: colors.text.secondary, marginTop: -16 }}>
        Customize this agent{'\u2019'}s display name
      </div>
    </div>
  )
}
