import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'
import { fonts } from '../../components/marketing/design-tokens'

interface NotificationFooterProps {
  /** Frame when the counter starts incrementing */
  counterStart: number
  /** Frame when the counter reaches its final value */
  counterEnd: number
  /** Final counter value (e.g. 9) */
  totalFiles: number
  /** Frame when the Clear button appears */
  clearAppearFrame: number
}

export const NotificationFooter: React.FC<NotificationFooterProps> = ({
  counterStart,
  counterEnd,
  totalFiles,
  clearAppearFrame,
}) => {
  const frame = useCurrentFrame()

  // Footer container fade-in
  const containerOpacity = interpolate(frame, [counterStart, counterStart + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Counter: 0 -> totalFiles
  const counterProgress = interpolate(frame, [counterStart, counterEnd], [0, totalFiles], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const displayCount = Math.round(counterProgress)

  // Clear button fade
  const clearOpacity = interpolate(frame, [clearAppearFrame, clearAppearFrame + 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        borderTop: '1px solid #E2E8F0',
        opacity: containerOpacity,
      }}
    >
      {/* Counter */}
      <span
        style={{
          fontFamily: fonts.sans,
          fontSize: 14,
          fontWeight: 400,
          color: '#6B7280',
        }}
      >
        {displayCount} completed
      </span>

      {/* Clear button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          opacity: clearOpacity,
        }}
      >
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: 14,
            fontWeight: 500,
            color: '#6B7280',
          }}
        >
          Clear
        </span>
        {/* Trash icon */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 4.5H13M6 4.5V3.5C6 2.95 6.45 2.5 7 2.5H9C9.55 2.5 10 2.95 10 3.5V4.5M12 4.5V13C12 13.55 11.55 14 11 14H5C4.45 14 4 13.55 4 13V4.5"
            stroke="#6B7280"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}
