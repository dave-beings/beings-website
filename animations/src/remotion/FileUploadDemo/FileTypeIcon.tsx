import React from 'react'

export type FileType = 'pdf' | 'video' | 'txt'

interface FileTypeIconProps {
  type: FileType
  size?: number
}

const PDF_BG = '#FEE2E2'
const PDF_COLOR = '#EF4444'
const VIDEO_BG = '#DBEAFE'
const VIDEO_COLOR = '#3B82F6'
const TXT_BG = '#F3F4F6'
const TXT_COLOR = '#6B7280'

export const FileTypeIcon: React.FC<FileTypeIconProps> = ({ type, size = 40 }) => {
  const borderRadius = size * 0.2

  if (type === 'pdf') {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius,
          background: PDF_BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width={size * 0.5}
          height={size * 0.5}
          viewBox="0 0 20 20"
          fill="none"
        >
          {/* PDF document icon with folded corner */}
          <path
            d="M4 2C4 0.9 4.9 0 6 0H12L18 6V18C18 19.1 17.1 20 16 20H6C4.9 20 4 19.1 4 18V2Z"
            fill={PDF_COLOR}
            opacity={0.2}
          />
          <path
            d="M12 0L18 6H14C12.9 6 12 5.1 12 4V0Z"
            fill={PDF_COLOR}
            opacity={0.35}
          />
          {/* PDF text */}
          <text
            x="10"
            y="15"
            textAnchor="middle"
            fill={PDF_COLOR}
            fontSize="6.5"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            PDF
          </text>
        </svg>
      </div>
    )
  }

  if (type === 'video') {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius,
          background: VIDEO_BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width={size * 0.45}
          height={size * 0.45}
          viewBox="0 0 20 20"
          fill="none"
        >
          {/* Play triangle */}
          <path
            d="M6 3.5V16.5C6 17.3 6.9 17.8 7.6 17.3L17.1 10.8C17.7 10.4 17.7 9.6 17.1 9.2L7.6 2.7C6.9 2.2 6 2.7 6 3.5Z"
            fill={VIDEO_COLOR}
          />
        </svg>
      </div>
    )
  }

  // TXT
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius,
        background: TXT_BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 20 20"
        fill="none"
      >
        <rect x="2" y="2" width="16" height="16" rx="2" fill={TXT_COLOR} opacity={0.15} />
        <text
          x="10"
          y="13.5"
          textAnchor="middle"
          fill={TXT_COLOR}
          fontSize="6"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          TXT
        </text>
      </svg>
    </div>
  )
}
