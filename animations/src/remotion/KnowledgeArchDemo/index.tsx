import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { colors, fonts, radius, shadows } from '../../components/marketing/design-tokens'
import { VennDiagram } from './VennDiagram'

/**
 * ── TIMING CONFIG ──────────────────────────────────────────
 * All values are frame numbers at 30fps (so 30 = 1 second).
 *
 * Phase 1:  Card entrance           — frames 0–20     (0.7s)
 * Phase 2:  Circle 1 (Personal)     — frames 25–55    (1.0s)
 * Phase 3:  Circle 2 (Project)      — frames 45–75    (1.0s)
 * Phase 4:  Circle 3 (Org)          — frames 65–95    (1.0s)
 * Phase 5:  Labels fade in          — frames 90–125   (1.2s)
 * Phase 6:  Data dots orbit         — frames 105–270  (5.5s)
 * Phase 7:  Boundary glow pulse     — frames 140–175  (1.2s)
 * Phase 8:  Shield icon appears     — frames 170–200  (1.0s)
 * Phase 9:  Tagline text            — frames 205–225  (0.7s)
 * Phase 10: Hold                    — frames 225–280  (1.8s)
 * Phase 11: Loop fade               — frames 280–299  (0.7s)
 * ───────────────────────────────────────────────────────────
 */
export const TIMING = {
  cardEntranceStart: 0,
  cardEntranceEnd: 20,

  circle1Reveal: 25,
  circle2Reveal: 45,
  circle3Reveal: 65,
  circleRevealDuration: 30,

  label1Reveal: 90,
  label2Reveal: 100,
  label3Reveal: 110,

  dotsStart: 105,

  glowPulseStart: 140,
  glowPulseEnd: 175,

  shieldReveal: 170,
  shieldRevealDuration: 30,

  taglineReveal: 205,

  loopFadeStart: 280,
  loopFadeEnd: 299,
} as const

export const COMPOSITION_WIDTH = 800
export const COMPOSITION_HEIGHT = 500
export const FPS = 30
export const DURATION_IN_FRAMES = 300

export const KnowledgeArchDemo: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const entranceProgress = spring({
    frame: frame - TIMING.cardEntranceStart,
    fps,
    config: { damping: 200 },
    durationInFrames: TIMING.cardEntranceEnd - TIMING.cardEntranceStart,
  })
  const cardScale = interpolate(entranceProgress, [0, 1], [0.95, 1])
  const cardOpacity = interpolate(entranceProgress, [0, 1], [0, 1])

  const loopFade = interpolate(frame, [TIMING.loopFadeStart, TIMING.loopFadeEnd], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const headingProgress = spring({
    frame: frame - TIMING.circle1Reveal,
    fps,
    config: { damping: 200 },
  })
  const headingOpacity = interpolate(headingProgress, [0, 1], [0, 1])

  const taglineProgress = spring({
    frame: frame - TIMING.taglineReveal,
    fps,
    config: { damping: 200 },
  })
  const taglineOpacity = interpolate(taglineProgress, [0, 1], [0, 1])
  const taglineY = interpolate(taglineProgress, [0, 1], [8, 0])

  const opacity = Math.min(cardOpacity, loopFade)

  return (
    <AbsoluteFill
      style={{
        background: colors.surface.gray50,
        fontFamily: fonts.sans,
        opacity,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 24,
          borderRadius: radius.lg,
          overflow: 'hidden',
          background: colors.surface.white,
          boxShadow: shadows.elevated,
          border: `1px solid ${colors.surface.gray200}`,
          transform: `scale(${cardScale})`,
          transformOrigin: 'center center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            paddingTop: 18,
            opacity: headingOpacity,
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.12em',
            color: colors.brand.primary,
          }}
        >
          Multi-Corpus Architecture
        </div>

        <div style={{ flex: 1, width: '100%', minHeight: 0, position: 'relative' }}>
          <VennDiagram
            circleRevealFrames={[TIMING.circle1Reveal, TIMING.circle2Reveal, TIMING.circle3Reveal]}
            circleRevealDuration={TIMING.circleRevealDuration}
            labelRevealFrames={[TIMING.label1Reveal, TIMING.label2Reveal, TIMING.label3Reveal]}
            dotsStartFrame={TIMING.dotsStart}
            glowPulseStart={TIMING.glowPulseStart}
            glowPulseEnd={TIMING.glowPulseEnd}
            shieldRevealFrame={TIMING.shieldReveal}
            shieldRevealDuration={TIMING.shieldRevealDuration}
          />
        </div>

        <div
          style={{
            paddingBottom: 20,
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: colors.text.primary,
              letterSpacing: '0.01em',
            }}
          >
            Three knowledge bases
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: colors.text.muted,
            }}
          >
            {'\u00B7'}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: colors.text.primary,
            }}
          >
            Zero cross-contamination
          </span>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 30,
          right: 34,
          fontFamily: fonts.sans,
          fontSize: 8,
          fontWeight: 500,
          color: colors.text.muted,
          letterSpacing: '0.04em',
          opacity: 0.5,
        }}
      >
        beings.com
      </div>
    </AbsoluteFill>
  )
}
