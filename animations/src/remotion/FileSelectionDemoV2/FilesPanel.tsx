import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { colors, fonts } from '../../components/marketing/design-tokens'

interface FilesPanelProps {
  headerAppearFrame: number
  rowStartFrame: number
  rowStaggerGap: number
  checkboxClickFrame: number
}

const FILES = [
  { name: 'Patient Interview Transcripts.pdf', size: '2.4 MB' },
  { name: 'Consent Forms \u2013 Batch 3.pdf', size: '1.1 MB' },
  { name: 'Focus Group Notes \u2013 March.pdf', size: '890 KB' },
]

export const FilesPanel: React.FC<FilesPanelProps> = ({
  headerAppearFrame,
  rowStartFrame,
  rowStaggerGap,
  checkboxClickFrame,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Header entrance fade
  const headerOpacity = interpolate(frame, [headerAppearFrame, headerAppearFrame + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: colors.surface.white,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: `1px solid ${colors.surface.gray200}`,
          flexShrink: 0,
          opacity: headerOpacity,
        }}
      >
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: 11,
            fontWeight: 600,
            color: colors.text.primary,
          }}
        >
          Total Files: 3
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Refresh icon */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M10 3.5A4.5 4.5 0 002.2 4.3M2 8.5A4.5 4.5 0 009.8 7.7"
              stroke={colors.text.muted}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path d="M10 1.5v2h-2" stroke={colors.text.muted} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 10.5v-2h2" stroke={colors.text.muted} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {/* Search icon */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="5" cy="5" r="3.5" stroke={colors.text.muted} strokeWidth="1.2" />
            <path d="M8 8l2.5 2.5" stroke={colors.text.muted} strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* File rows */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {FILES.map((file, i) => {
          const rowAppearFrame = rowStartFrame + i * rowStaggerGap

          // Staggered entrance: opacity 0->1, translateY 8->0
          const rowSpring = spring({
            frame: frame - rowAppearFrame,
            fps,
            config: { damping: 200 },
            durationInFrames: 15,
          })
          const rowOpacity = interpolate(rowSpring, [0, 1], [0, 1])
          const rowTranslateY = interpolate(rowSpring, [0, 1], [8, 0])

          const isThirdRow = i === 2
          const isChecked = isThirdRow && frame >= checkboxClickFrame

          // Checkbox animation on 3rd row
          const checkProgress = isThirdRow
            ? spring({
                frame: frame - checkboxClickFrame,
                fps,
                config: { damping: 20, stiffness: 200 },
              })
            : 0

          // Scale pulse: 1 -> 1.15 -> 1
          const checkScale = isChecked
            ? interpolate(checkProgress, [0, 0.5, 1], [1, 1.15, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })
            : 1

          // Background fill: transparent -> blue
          const checkFill = isChecked
            ? interpolate(checkProgress, [0, 0.3], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })
            : 0

          // Row highlight on 3rd row after click
          const highlightOpacity =
            isThirdRow && frame >= checkboxClickFrame
              ? interpolate(frame, [checkboxClickFrame, checkboxClickFrame + 8], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                })
              : 0

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 14px',
                borderBottom: `1px solid ${colors.surface.gray200}`,
                opacity: rowOpacity,
                transform: `translateY(${rowTranslateY}px)`,
                position: 'relative',
                background:
                  highlightOpacity > 0
                    ? `rgba(4, 156, 240, ${0.06 * highlightOpacity})`
                    : 'transparent',
                borderLeft:
                  highlightOpacity > 0
                    ? `3px solid rgba(4, 156, 240, ${highlightOpacity})`
                    : '3px solid transparent',
              }}
            >
              {/* Document icon */}
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none" style={{ flexShrink: 0 }}>
                <rect
                  x="0.5"
                  y="0.5"
                  width="13"
                  height="15"
                  rx="2"
                  fill={colors.surface.gray100}
                  stroke={colors.surface.gray300}
                />
                <path
                  d="M3.5 5H10.5M3.5 7.5H10.5M3.5 10H7.5"
                  stroke={colors.text.muted}
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
              </svg>

              {/* Filename */}
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 11,
                  fontWeight: 500,
                  color: colors.text.primary,
                  marginLeft: 10,
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {file.name}
              </span>

              {/* File size */}
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 9,
                  color: colors.text.muted,
                  marginLeft: 8,
                  flexShrink: 0,
                }}
              >
                {file.size}
              </span>

              {/* Checkbox */}
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  border: checkFill > 0.5 ? 'none' : `1.5px solid ${colors.surface.gray300}`,
                  background:
                    checkFill > 0
                      ? `rgba(4, 156, 240, ${checkFill})`
                      : 'transparent',
                  marginLeft: 12,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${checkScale})`,
                }}
              >
                {checkFill > 0.3 && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              {/* Expand chevron */}
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                style={{ marginLeft: 8, flexShrink: 0 }}
              >
                <path
                  d="M3.5 2L6.5 5L3.5 8"
                  stroke={colors.text.muted}
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* More dots */}
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                style={{ marginLeft: 6, flexShrink: 0 }}
              >
                <circle cx="5" cy="2" r="0.8" fill={colors.text.muted} />
                <circle cx="5" cy="5" r="0.8" fill={colors.text.muted} />
                <circle cx="5" cy="8" r="0.8" fill={colors.text.muted} />
              </svg>
            </div>
          )
        })}
      </div>
    </div>
  )
}
