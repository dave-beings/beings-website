import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'
import { fonts } from '../../components/marketing/design-tokens'

interface NotificationHeaderProps {
  appearStart: number
  appearEnd: number
  /** Dynamic count of files uploaded so far */
  filesUploaded: number
}

const SUCCESS_GREEN = '#22C55E'

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  appearStart,
  appearEnd,
  filesUploaded,
}) => {
  const frame = useCurrentFrame()

  const opacity = interpolate(frame, [appearStart, appearEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const translateY = interpolate(frame, [appearStart, appearEnd], [6, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #E2E8F0',
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {/* Green cloud-upload icon */}
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M14 8V18M14 8L10 12M14 8L18 12"
          stroke={SUCCESS_GREEN}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.5 18.5C5 18.5 3 16.5 3 14C3 11.8 4.6 10 6.7 9.6C7.5 6.4 10.5 4 14 4C18.2 4 21.5 7 21.7 10.8C24 11.5 25.5 13.5 25.5 16C25.5 19 23 21.5 20 21.5H7.5"
          stroke={SUCCESS_GREEN}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {/* Title */}
      <span
        style={{
          marginLeft: 10,
          fontFamily: fonts.sans,
          fontSize: 16,
          fontWeight: 600,
          color: '#101A29',
          flex: 1,
        }}
      >
        {filesUploaded} {filesUploaded === 1 ? 'file' : 'files'} uploaded
      </span>

      {/* Chevron down icon */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        style={{ marginRight: 8, opacity: 0.4 }}
      >
        <path
          d="M6 8L10 12L14 8"
          stroke="#6B7280"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Close X icon */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        style={{ opacity: 0.4 }}
      >
        <path
          d="M6 6L14 14M14 6L6 14"
          stroke="#6B7280"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
