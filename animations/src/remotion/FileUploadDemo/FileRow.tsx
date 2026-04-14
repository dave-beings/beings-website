import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { fonts } from '../../components/marketing/design-tokens'
import { FileTypeIcon, type FileType } from './FileTypeIcon'

interface FileRowProps {
  fileName: string
  fileSize: string
  fileType: FileType
  /** Frame when this row begins its entrance */
  startFrame: number
}

const SUCCESS_GREEN = '#22C55E'

/** Duration of each micro-animation phase (in frames) */
const SLIDE_DURATION = 8
const PROGRESS_DELAY = 6
const PROGRESS_DURATION = 12
const STATUS_SWAP_DELAY = 16
const CHECK_DELAY = 18

export const FileRow: React.FC<FileRowProps> = ({
  fileName,
  fileSize,
  fileType,
  startFrame,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const elapsed = frame - startFrame

  // Don\u2019t render anything before this row\u2019s start
  if (elapsed < -1) return null

  // ── Slide-in ──
  const slideSpring = spring({
    frame: Math.max(0, elapsed),
    fps,
    config: { damping: 200 },
    durationInFrames: SLIDE_DURATION,
  })
  const translateY = interpolate(slideSpring, [0, 1], [24, 0])
  const rowOpacity = interpolate(slideSpring, [0, 1], [0, 1])

  // ── Progress bar fill ──
  const progressSpring = spring({
    frame: Math.max(0, elapsed - PROGRESS_DELAY),
    fps,
    config: { damping: 200 },
    durationInFrames: PROGRESS_DURATION,
  })
  const progressWidth = interpolate(progressSpring, [0, 1], [0, 100])

  // ── Status text swap (Uploading... -> Uploaded) ──
  const isUploaded = elapsed >= STATUS_SWAP_DELAY

  // ── Progress bar visibility (fades out once uploaded) ──
  const progressOpacity = interpolate(
    elapsed,
    [STATUS_SWAP_DELAY, STATUS_SWAP_DELAY + 5],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )

  // ── Green checkmark pop ──
  const checkSpring = spring({
    frame: Math.max(0, elapsed - CHECK_DELAY),
    fps,
    config: { damping: 20, stiffness: 200 },
    durationInFrames: 10,
  })

  // ── Animated dots for "Uploading..." ──
  const dotCount = Math.floor((elapsed % 12) / 4) + 1
  const uploadingText = 'Uploading' + '.'.repeat(Math.min(dotCount, 3))

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 20px',
        opacity: rowOpacity,
        transform: `translateY(${translateY}px)`,
        position: 'relative',
      }}
    >
      {/* File type icon */}
      <FileTypeIcon type={fileType} size={40} />

      {/* File info */}
      <div
        style={{
          flex: 1,
          marginLeft: 14,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            fontFamily: fonts.sans,
            fontSize: 14,
            fontWeight: 500,
            color: '#101A29',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {fileName}
        </div>

        <div
          style={{
            fontFamily: fonts.sans,
            fontSize: 12,
            fontWeight: 400,
            color: '#9CA3AF',
            marginTop: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>{fileSize}</span>
          <span style={{ color: '#D1D5DB' }}>{'\u00B7'}</span>
          <span style={{ color: isUploaded ? '#22C55E' : '#9CA3AF' }}>
            {isUploaded ? 'Uploaded' : uploadingText}
          </span>
        </div>

        {/* Progress bar (under the text, fades out once done) */}
        {progressOpacity > 0.01 && (
          <div
            style={{
              marginTop: 4,
              height: 3,
              borderRadius: 2,
              background: '#E5E7EB',
              overflow: 'hidden',
              opacity: progressOpacity,
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressWidth}%`,
                borderRadius: 2,
                background: SUCCESS_GREEN,
              }}
            />
          </div>
        )}
      </div>

      {/* Green checkmark circle */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          background: SUCCESS_GREEN,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginLeft: 12,
          transform: `scale(${checkSpring})`,
          opacity: checkSpring,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M3 7.5L5.5 10L11 4"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

/** Frame offset after startFrame when the file is considered "complete" */
export const FILE_COMPLETE_OFFSET = CHECK_DELAY + 6
