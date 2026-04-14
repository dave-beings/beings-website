import React from 'react'

interface IconProps {
  size?: number
  color?: string
}

const DEFAULT_COLOR = '#ffffff'

export const ShieldCheckIcon: React.FC<IconProps> = ({ size = 24, color = DEFAULT_COLOR }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2L4 6v5.09C4 16.14 7.41 20.85 12 22c4.59-1.15 8-5.86 8-10.91V6L12 2z"
      fill={color}
      fillOpacity="0.25"
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M9 12l2 2 4-4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const ClipboardListIcon: React.FC<IconProps> = ({ size = 24, color = DEFAULT_COLOR }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="6" y="5" width="12" height="15" rx="1.5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15" />
    <path d="M9 5V4a1 1 0 011-1h4a1 1 0 011 1v1" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 11h6M9 14h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export const ShieldStarIcon: React.FC<IconProps> = ({ size = 24, color = DEFAULT_COLOR }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2L4 6v5.09C4 16.14 7.41 20.85 12 22c4.59-1.15 8-5.86 8-10.91V6L12 2z"
      fill={color}
      fillOpacity="0.25"
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M12 7l.9 2.76H16l-2.37 1.72.91 2.77L12 12.54l-2.54 1.71.91-2.77L8 9.76h3.1L12 7z"
      fill={color}
      stroke={color}
      strokeWidth="0.5"
      strokeLinejoin="round"
    />
  </svg>
)

export const CloudCheckIcon: React.FC<IconProps> = ({ size = 24, color = DEFAULT_COLOR }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M17.5 19H7a5 5 0 01-.5-9.98A7 7 0 0119.5 13.5 3.5 3.5 0 0117.5 19z"
      fill={color}
      fillOpacity="0.2"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.5 14.5l2 2 3.5-3.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const MedicalCrossIcon: React.FC<IconProps> = ({ size = 24, color = DEFAULT_COLOR }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="10" y="4" width="4" height="16" rx="1" fill={color} />
    <rect x="4" y="10" width="16" height="4" rx="1" fill={color} />
  </svg>
)

export const LockIcon: React.FC<IconProps> = ({ size = 24, color = DEFAULT_COLOR }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect
      x="5"
      y="11"
      width="14"
      height="10"
      rx="2"
      fill={color}
      fillOpacity="0.2"
      stroke={color}
      strokeWidth="1.5"
    />
    <path
      d="M8 11V8a4 4 0 018 0v3"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="12" cy="16.5" r="1.5" fill={color} />
  </svg>
)

export const EyeIcon: React.FC<IconProps> = ({ size = 24, color = DEFAULT_COLOR }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
      fill={color}
      fillOpacity="0.2"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" fill={color} stroke={color} strokeWidth="1" />
  </svg>
)
