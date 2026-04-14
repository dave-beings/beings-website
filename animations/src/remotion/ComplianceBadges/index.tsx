import React from 'react'
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { colors, fonts, radius, shadows } from '../../components/marketing/design-tokens'
import { BadgeItem } from './BadgeItem'
import {
  ClipboardListIcon,
  LockIcon,
  EyeIcon,
} from './icons'
import iso27001Logo from './assets/iso27001.png'
import hipaaLogo from './assets/hipaa.png'
import soc2Logo from './assets/soc2.png'
import gdprLogo from './assets/gdpr.png'

/**
 * ── TIMING CONFIG ──────────────────────────────────────────
 * All values are frame numbers at 30fps (so 30 = 1 second).
 *
 * Phase 1: Card enters + badge 1 pops in  — frames 5–23   (0.6s)
 * Phase 2–7: Badges 2–7 staggered at 18f  — frames 23–131 (each 0.6s)
 *   badge1Start: 5    badge2Start: 23   badge3Start: 41
 *   badge4Start: 59   badge5Start: 77   badge6Start: 95   badge7Start: 113
 * Each badge types from (startFrame + 14), longest label ~8 frames
 * Last badge done typing: ~113 + 14 + 8 = 135 frames
 * Phase 8: Hold all badges visible       — frames 135–210 (2.5s)
 * Phase 9: Fade out for loop             — frames 210–230 (0.67s)
 * ───────────────────────────────────────────────────────────
 */
export const TIMING = {
  // Card entrance
  cardEnterStart: 0,
  cardEnterEnd: 18,

  // Badge reveal timing (staggered by 18 frames = 0.6s each)
  badge1Start: 5,
  badge2Start: 23,
  badge3Start: 41,
  badge4Start: 59,
  badge5Start: 77,
  badge6Start: 95,
  badge7Start: 113,

  // Loop fade
  loopFadeStart: 210,
  loopFadeEnd: 230,
} as const

export const COMPOSITION_WIDTH = 520
export const COMPOSITION_HEIGHT = 260
export const FPS = 30
export const DURATION_IN_FRAMES = 235

const BADGES: { label: string; icon?: React.ReactNode; imageSrc?: string; startFrame: number }[] = [
  {
    label: 'ISO 27001:2022',
    imageSrc: iso27001Logo,
    startFrame: TIMING.badge1Start,
  },
  {
    label: 'HIPAA',
    imageSrc: hipaaLogo,
    startFrame: TIMING.badge2Start,
  },
  {
    label: 'GDPR compliant',
    imageSrc: gdprLogo,
    startFrame: TIMING.badge3Start,
  },
  {
    label: 'SOC 2 infrastructure',
    imageSrc: soc2Logo,
    startFrame: TIMING.badge4Start,
  },
  {
    label: 'Audit logs',
    icon: <ClipboardListIcon size={26} />,
    startFrame: TIMING.badge5Start,
  },
  {
    label: 'Data security',
    icon: <LockIcon size={26} />,
    startFrame: TIMING.badge6Start,
  },
  {
    label: 'Processing transparency',
    icon: <EyeIcon size={26} />,
    startFrame: TIMING.badge7Start,
  },
]

export const ComplianceBadges: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Card entrance: scale 0.96→1 + opacity 0→1
  const cardEnter = spring({
    frame: frame - TIMING.cardEnterStart,
    fps,
    config: { damping: 200 },
    durationInFrames: TIMING.cardEnterEnd - TIMING.cardEnterStart,
  })
  const cardScale = interpolate(cardEnter, [0, 1], [0.96, 1])
  const cardOpacity = interpolate(cardEnter, [0, 1], [0, 1])

  // Loop fade for smooth looping
  const loopFade = interpolate(frame, [TIMING.loopFadeStart, TIMING.loopFadeEnd], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const containerOpacity = Math.min(cardOpacity, loopFade)

  return (
    <AbsoluteFill
      style={{
        background: colors.surface.gray50,
        fontFamily: fonts.sans,
      }}
    >
      {/* Main card */}
      <div
        style={{
          position: 'absolute',
          inset: 14,
          borderRadius: radius.lg,
          overflow: 'hidden',
          background: colors.surface.white,
          boxShadow: shadows.elevated,
          border: `1px solid ${colors.surface.gray200}`,
          transform: `scale(${cardScale})`,
          opacity: containerOpacity,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        {/* Badge grid — 4 on top, 3 on bottom */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            padding: '20px 16px 14px',
            gap: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-around',
              width: '100%',
            }}
          >
            {BADGES.slice(0, 4).map((badge, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <BadgeItem
                  label={badge.label}
                  startFrame={badge.startFrame}
                  icon={badge.icon}
                  imageSrc={badge.imageSrc}
                />
              </div>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'center',
              width: '75%',
            }}
          >
            {BADGES.slice(4).map((badge, i) => (
              <div
                key={i + 4}
                style={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <BadgeItem
                  label={badge.label}
                  startFrame={badge.startFrame}
                  icon={badge.icon}
                  imageSrc={badge.imageSrc}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* beings.com watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 26,
          right: 30,
          fontFamily: fonts.sans,
          fontSize: 8,
          fontWeight: 500,
          color: colors.text.muted,
          letterSpacing: '0.04em',
          opacity: containerOpacity * 0.5,
        }}
      >
        beings.com
      </div>
    </AbsoluteFill>
  )
}
