import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { colors, fonts } from '../../components/marketing/design-tokens'

interface StorageHeaderProps {
  /** Frame when title + search appear */
  titleAppearFrame: number
  /** Frame range for stats counter animation */
  statsStartFrame: number
  statsEndFrame: number
  /** Frame when search bar gets blue focus border (cursor click) */
  searchFocusFrame: number
}

// Stats targets
const STATS = [
  { label: 'mins', target: 204 },
  { label: 'words', target: 39260 },
  { label: 'sources', target: 10 },
] as const

export const StorageHeader: React.FC<StorageHeaderProps> = ({
  titleAppearFrame,
  statsStartFrame,
  statsEndFrame,
  searchFocusFrame,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Title entrance
  const titleProgress = spring({
    frame: frame - titleAppearFrame,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  })
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1])
  const titleTranslateY = interpolate(titleProgress, [0, 1], [12, 0])

  // Search bar focus state
  const isFocused = frame >= searchFocusFrame

  return (
    <div style={{ padding: '16px 16px 12px 16px' }}>
      {/* Title row */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleTranslateY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: fonts.sans,
            fontSize: 18,
            fontWeight: 700,
            color: colors.text.primary,
            marginBottom: 4,
          }}
        >
          Recent
        </div>
      </div>

      {/* Stats line */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          marginBottom: 12,
          fontFamily: fonts.sans,
          fontSize: 11,
          color: colors.text.secondary,
        }}
      >
        {STATS.map((stat, i) => {
          // Stagger each stat counter by 8 frames
          const statStart = statsStartFrame + i * 8
          const statProgress = interpolate(
            frame,
            [statStart, statsEndFrame],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          )
          const value = Math.round(stat.target * statProgress)

          // Fade in each stat
          const statOpacity = interpolate(
            frame,
            [statStart, statStart + 10],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          )

          return (
            <span key={stat.label} style={{ opacity: statOpacity }}>
              {i > 0 && (
                <span style={{ margin: '0 4px', color: colors.text.muted }}>|</span>
              )}
              {value.toLocaleString()} {stat.label}
            </span>
          )
        })}

        {/* Info icon */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          style={{
            marginLeft: 2,
            opacity: interpolate(frame, [statsStartFrame + 20, statsStartFrame + 30], [0, 0.5], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          <circle cx="8" cy="8" r="7" stroke={colors.text.muted} strokeWidth="1.2" />
          <path d="M8 7V11" stroke={colors.text.muted} strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="8" cy="5" r="0.8" fill={colors.text.muted} />
        </svg>
      </div>

      {/* Search + Sort row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: titleOpacity,
          transform: `translateY(${titleTranslateY}px)`,
        }}
      >
        {/* Search bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: colors.surface.gray50,
            borderRadius: 8,
            padding: '6px 10px',
            border: isFocused
              ? `1.5px solid ${colors.brand.primary}`
              : `1.5px solid ${colors.surface.gray200}`,
            width: 180,
            transition: 'none', // Remotion doesn't use CSS transitions
          }}
        >
          {/* Magnifying glass */}
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke={colors.text.muted} strokeWidth="1.5" />
            <path d="M11 11L14 14" stroke={colors.text.muted} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: 11,
              color: colors.text.muted,
            }}
          >
            Search by title
          </span>
        </div>

        {/* Sort + View controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Latest dropdown pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 10px',
              borderRadius: 8,
              border: `1.5px solid ${colors.surface.gray200}`,
              background: colors.surface.white,
              fontFamily: fonts.sans,
              fontSize: 11,
              fontWeight: 500,
              color: colors.text.primary,
            }}
          >
            {/* Sort icon */}
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M4 5L8 2L12 5" stroke={colors.text.secondary} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 11L8 14L12 11" stroke={colors.text.secondary} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Latest
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M3 5L6 8L9 5" stroke={colors.text.secondary} strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>

          {/* List view icon (active) */}
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              border: `1.5px solid ${colors.surface.gray200}`,
              background: colors.surface.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 4H14M2 8H14M2 12H14" stroke={colors.text.primary} strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </div>

          {/* Grid view icon */}
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              border: `1.5px solid ${colors.surface.gray200}`,
              background: colors.surface.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" rx="1" stroke={colors.text.muted} strokeWidth="1.2" />
              <rect x="9" y="2" width="5" height="5" rx="1" stroke={colors.text.muted} strokeWidth="1.2" />
              <rect x="2" y="9" width="5" height="5" rx="1" stroke={colors.text.muted} strokeWidth="1.2" />
              <rect x="9" y="9" width="5" height="5" rx="1" stroke={colors.text.muted} strokeWidth="1.2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
