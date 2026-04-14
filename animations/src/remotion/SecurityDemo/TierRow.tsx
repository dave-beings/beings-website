import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { colors, fonts } from '../../components/marketing/design-tokens'

interface TierRowProps {
  /** Traffic light color for the circle indicator */
  tierColor: string
  /** Tier display name */
  name: string
  /** Description text below the name */
  description: string
  /** Optional badge text (e.g. "Coming Soon", "Active") */
  badge?: string
  /** Badge style: 'gray' for Coming Soon, 'amber' for Active */
  badgeVariant?: 'gray' | 'amber'
  /** Model count shown on the right */
  modelCount?: string
  /** Frame when this row should fade in */
  revealFrame: number
  /** Whether this row is currently selected (highlighted bg) */
  isSelected: boolean
  /** Frame when selection highlight starts */
  selectFrame?: number
  /** Whether expanded section is visible */
  isExpanded: boolean
  /** Frame when expand starts */
  expandFrame?: number
  /** Content to render inside the expanded area */
  children?: React.ReactNode
}

export const TierRow: React.FC<TierRowProps> = ({
  tierColor,
  name,
  description,
  badge,
  badgeVariant = 'gray',
  modelCount,
  revealFrame,
  isSelected,
  selectFrame = 0,
  isExpanded,
  expandFrame = 0,
  children,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Entrance animation: fadeInUp
  const entranceProgress = spring({
    frame: frame - revealFrame,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  })
  const entranceOpacity = interpolate(entranceProgress, [0, 1], [0, 1])
  const entranceY = interpolate(entranceProgress, [0, 1], [12, 0])

  // Selection highlight
  const selectProgress = selectFrame
    ? spring({
        frame: frame - selectFrame,
        fps,
        config: { damping: 200 },
        durationInFrames: 12,
      })
    : 0
  const highlightOpacity = isSelected ? interpolate(selectProgress, [0, 1], [0, 1]) : 0

  // Expand animation
  const expandProgress = expandFrame
    ? spring({
        frame: frame - expandFrame,
        fps,
        config: { damping: 200 },
        durationInFrames: 18,
      })
    : 0
  const expandHeight = isExpanded ? interpolate(expandProgress, [0, 1], [0, 1]) : 0

  // Badge colors
  const badgeStyles =
    badgeVariant === 'amber'
      ? { bg: 'rgba(245,158,11,0.15)', color: '#D97706', border: 'rgba(245,158,11,0.3)' }
      : { bg: colors.surface.gray100, color: colors.text.secondary, border: colors.surface.gray200 }

  // Chevron rotation
  const chevronRotation = isExpanded ? interpolate(expandProgress, [0, 1], [0, 180]) : 0

  return (
    <div
      style={{
        opacity: entranceOpacity,
        transform: `translateY(${entranceY}px)`,
        borderRadius: 10,
        padding: '10px 12px',
        marginBottom: 4,
        background: `rgba(245,158,11,${highlightOpacity * 0.06})`,
        transition: 'none', // no CSS transitions in Remotion
      }}
    >
      {/* Main row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {/* Color dot */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: tierColor,
            opacity: 0.2,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: tierColor,
              opacity: 1,
              position: 'absolute',
            }}
          />
        </div>

        {/* Name + description */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: colors.text.primary,
                fontFamily: fonts.sans,
              }}
            >
              {name}
            </span>
            {badge && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: badgeStyles.color,
                  background: badgeStyles.bg,
                  border: `1px solid ${badgeStyles.border}`,
                  borderRadius: 99,
                  padding: '1px 8px',
                  fontFamily: fonts.sans,
                  letterSpacing: '0.02em',
                }}
              >
                {badge}
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 10.5,
              color: colors.text.secondary,
              fontFamily: fonts.sans,
              marginTop: 1,
            }}
          >
            {description}
          </div>
        </div>

        {/* Model count + chevron */}
        {modelCount && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              color: colors.text.secondary,
              fontFamily: fonts.sans,
              flexShrink: 0,
            }}
          >
            <span>{modelCount}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{ transform: `rotate(${chevronRotation}deg)` }}
            >
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke={colors.text.secondary}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && expandHeight > 0 && (
        <div
          style={{
            overflow: 'hidden',
            maxHeight: expandHeight * 200, // generous maxHeight
            opacity: expandHeight,
            marginTop: 8,
            paddingLeft: 48, // align with text after dot
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
