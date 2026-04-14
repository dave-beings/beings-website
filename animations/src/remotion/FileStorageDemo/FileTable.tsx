import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { colors, fonts } from '../../components/marketing/design-tokens'
import { FileTableRow } from './FileTableRow'

interface FileTableProps {
  /** Frame when column header row fades in */
  headerStartFrame: number
  headerEndFrame: number
  /** Start frames for each of the 3 rows */
  row1Start: number
  row2Start: number
  row3Start: number
  /** How many frames each row's slide animation lasts */
  rowSlideDuration: number
}

const COLUMNS: { label: string; flex?: string; width?: number; align?: 'left' | 'right'; showSort?: boolean }[] = [
  { label: '', width: 28 },          // checkbox
  { label: '', width: 40 },          // icon spacer
  { label: 'Name', flex: '1 1 0', showSort: true },
  { label: 'Location', width: 220 },
  { label: 'Size', width: 52, align: 'right' },
  { label: 'Type', width: 30 },
  { label: 'Modified', width: 72, align: 'right' },
  { label: '', width: 24 },          // menu spacer
]

export const FileTable: React.FC<FileTableProps> = ({
  headerStartFrame,
  headerEndFrame,
  row1Start,
  row2Start,
  row3Start,
  rowSlideDuration,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Column header fade in
  const headerProgress = spring({
    frame: frame - headerStartFrame,
    fps,
    config: { damping: 200 },
    durationInFrames: headerEndFrame - headerStartFrame,
  })
  const headerOpacity = interpolate(headerProgress, [0, 1], [0, 1])
  const headerTranslateY = interpolate(headerProgress, [0, 1], [8, 0])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Column header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 14px',
          background: colors.surface.gray50,
          borderBottom: `1px solid ${colors.surface.gray200}`,
          borderTop: `1px solid ${colors.surface.gray200}`,
          opacity: headerOpacity,
          transform: `translateY(${headerTranslateY}px)`,
        }}
      >
        {/* Checkbox column */}
        <div style={{ width: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              border: `1.5px solid ${colors.surface.gray300}`,
              background: colors.surface.white,
            }}
          />
        </div>

        {/* Icon spacer */}
        <div style={{ width: 40, flexShrink: 0 }} />

        {/* Name with sort arrow */}
        <div
          style={{
            flex: '1 1 0',
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontFamily: fonts.sans,
            fontSize: 10,
            fontWeight: 600,
            color: colors.text.primary,
          }}
        >
          Name
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M6 2L9 7H3L6 2Z" fill={colors.text.primary} />
          </svg>
        </div>

        {/* Location */}
        <div style={{ width: 220, flexShrink: 0, fontFamily: fonts.sans, fontSize: 10, fontWeight: 600, color: colors.text.secondary }}>
          Location
        </div>

        {/* Size */}
        <div style={{ width: 52, flexShrink: 0, fontFamily: fonts.sans, fontSize: 10, fontWeight: 600, color: colors.text.secondary, textAlign: 'right', paddingRight: 10 }}>
          Size
        </div>

        {/* Type */}
        <div style={{ width: 30, flexShrink: 0, fontFamily: fonts.sans, fontSize: 10, fontWeight: 600, color: colors.text.secondary }}>
          Type
        </div>

        {/* Modified */}
        <div style={{ width: 72, flexShrink: 0, fontFamily: fonts.sans, fontSize: 10, fontWeight: 600, color: colors.text.secondary, textAlign: 'right' }}>
          Modified
        </div>

        {/* Menu spacer */}
        <div style={{ width: 24, flexShrink: 0 }} />
      </div>

      {/* Data rows */}
      <div style={{ flex: 1 }}>
        <FileTableRow
          name="user_research_summary.pdf"
          location="Reactions to New Driverless Car Feature"
          size="3.57 Kb"
          type="pdf"
          date="27 Jan 2026"
          time="8:26 pm"
          startFrame={row1Start}
          slideDuration={rowSlideDuration}
        />
        <FileTableRow
          name={`Interview Transcripts \u2013 Pres copy.pdf`}
          location="Participant in Research Experience Survey (PRES)"
          size="25.67 Kb"
          type="pdf"
          date="27 Jan 2026"
          time="8:03 pm"
          startFrame={row2Start}
          slideDuration={rowSlideDuration}
        />
        <FileTableRow
          name="Participant Interview Transcripts.pdf"
          location="Participant in Research Experience Survey (PRES)"
          size="25.67 Kb"
          type="pdf"
          date="27 Jan 2026"
          time="8:03 pm"
          startFrame={row3Start}
          slideDuration={rowSlideDuration}
        />
      </div>
    </div>
  )
}
