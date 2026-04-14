import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { colors, fonts } from '../../components/marketing/design-tokens'
import { FileTypeIcon } from '../FileUploadDemo/FileTypeIcon'

interface FileTableRowProps {
  name: string
  location: string
  size: string
  type: string
  date: string
  time: string
  startFrame: number
  slideDuration: number
}

export const FileTableRow: React.FC<FileTableRowProps> = ({
  name,
  location,
  size,
  type,
  date,
  time,
  startFrame,
  slideDuration,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const elapsed = frame - startFrame

  // Don't render until just before start
  if (elapsed < -1) return null

  // Slide-in animation
  const slideProgress = spring({
    frame: elapsed,
    fps,
    config: { damping: 200 },
    durationInFrames: slideDuration,
  })

  const translateY = interpolate(slideProgress, [0, 1], [20, 0])
  const opacity = interpolate(slideProgress, [0, 1], [0, 1])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 14px',
        borderBottom: `1px solid ${colors.surface.gray100}`,
        opacity,
        transform: `translateY(${translateY}px)`,
        gap: 0,
      }}
    >
      {/* Checkbox */}
      <div
        style={{
          width: 28,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
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

      {/* PDF Icon */}
      <div style={{ flexShrink: 0, marginRight: 10 }}>
        <FileTypeIcon type="pdf" size={30} />
      </div>

      {/* Name */}
      <div
        style={{
          flex: '1 1 0',
          minWidth: 0,
          fontFamily: fonts.sans,
          fontSize: 11,
          fontWeight: 400,
          color: colors.text.primary,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          paddingRight: 10,
        }}
      >
        {name}
      </div>

      {/* Location pill */}
      <div
        style={{
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: colors.surface.gray50,
          borderRadius: 6,
          padding: '3px 8px',
          marginRight: 10,
          maxWidth: 220,
        }}
      >
        {/* Blue folder icon */}
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 3C2 2.448 2.448 2 3 2H6.586C6.851 2 7.105 2.105 7.293 2.293L8 3H13C13.552 3 14 3.448 14 4V12C14 12.552 13.552 13 13 13H3C2.448 13 2 12.552 2 12V3Z"
            fill={colors.brand.primary}
          />
        </svg>
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: 9,
            fontWeight: 400,
            color: colors.text.primary,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 190,
          }}
        >
          {location}
        </span>
      </div>

      {/* Size */}
      <div
        style={{
          width: 52,
          flexShrink: 0,
          fontFamily: fonts.sans,
          fontSize: 10,
          color: colors.text.secondary,
          textAlign: 'right',
          paddingRight: 10,
        }}
      >
        {size}
      </div>

      {/* Type */}
      <div
        style={{
          width: 30,
          flexShrink: 0,
          fontFamily: fonts.sans,
          fontSize: 10,
          color: colors.text.secondary,
        }}
      >
        {type}
      </div>

      {/* Date + Time */}
      <div
        style={{
          width: 72,
          flexShrink: 0,
          fontFamily: fonts.sans,
          fontSize: 10,
          color: colors.text.secondary,
          textAlign: 'right',
          lineHeight: 1.4,
        }}
      >
        <div>{date}</div>
        <div style={{ fontSize: 9, color: colors.text.muted }}>{time}</div>
      </div>

      {/* 3-dot menu */}
      <div
        style={{
          width: 24,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 4,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="3" r="1.2" fill={colors.text.muted} />
          <circle cx="8" cy="8" r="1.2" fill={colors.text.muted} />
          <circle cx="8" cy="13" r="1.2" fill={colors.text.muted} />
        </svg>
      </div>
    </div>
  )
}
