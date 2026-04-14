import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { colors, fonts, radius, shadows } from '../../components/marketing/design-tokens'
import { SettingsPanel } from './SettingsPanel'
import { WarningDialog } from './WarningDialog'
import { AnimatedCursor } from './AnimatedCursor'

/**
 * ── TIMING CONFIG ──────────────────────────────────────────
 * All values are frame numbers at 30fps (so 30 = 1 second).
 *
 * Phase 1: Panel fade in          — frames 0–44    (1.5s)
 * Phase 2: Tiers revealed         — frames 45–89   (1.5s)
 * Phase 3: Click UK Sovereign     — frames 90–149  (2.0s)
 * Phase 4: Click Global Cloud     — frames 150–299 (5.0s)
 *          Warning dialog in at 175, bullets finish ~197,
 *          holds readable for ~3.4s, fades out at 300–315
 * Phase 5: Model scroll           — frames 310–389 (2.7s)
 * Phase 6: Fade out               — frames 400–419 (0.7s)
 * ───────────────────────────────────────────────────────────
 */
export const TIMING = {
  // Phase 1: Panel entrance
  panelFadeInStart: 0,
  panelFadeInEnd: 20,

  // Phase 2: Tier row reveals (staggered by 12 frames)
  tierLocalReveal: 45,
  tierUkReveal: 57,
  tierGlobalReveal: 69,

  // Phase 3: Cursor → UK Sovereign click → expand
  cursorEnter1: 90,
  cursorClick1: 115,
  ukExpandStart: 118,

  // Phase 4: Cursor → Global Cloud click → warning dialog
  cursorEnter2: 150,
  cursorClick2: 170,
  warningDialogIn: 175,
  bulletStart: 185,
  bulletGap: 6,

  // Phase 5: Warning out → model list + scroll (+90 frames for readability)
  warningDialogOutStart: 300,
  warningDialogOutEnd: 315,
  modelListReveal: 310,
  modelScrollStart: 330,
  modelScrollEnd: 380,

  // Phase 6: Loop fade
  loopFadeStart: 400,
  loopFadeEnd: 419,

  // Cursor targets (composition-space: 600×550)
  cursor1X: 330,
  cursor1Y: 250,
  cursor2X: 330,
  cursor2Y: 340,
} as const

export const COMPOSITION_WIDTH = 600
export const COMPOSITION_HEIGHT = 550
export const FPS = 30
export const DURATION_IN_FRAMES = 420

export const SecurityDemo: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Phase 1: Panel entrance — scale 0.95→1 + opacity 0→1
  const entranceProgress = spring({
    frame: frame - TIMING.panelFadeInStart,
    fps,
    config: { damping: 200 },
    durationInFrames: TIMING.panelFadeInEnd - TIMING.panelFadeInStart,
  })
  const entranceScale = interpolate(entranceProgress, [0, 1], [0.95, 1])
  const entranceOpacity = interpolate(entranceProgress, [0, 1], [0, 1])

  // Phase 6: Loop fade
  const loopFade = interpolate(frame, [TIMING.loopFadeStart, TIMING.loopFadeEnd], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const opacity = Math.min(entranceOpacity, loopFade)

  // Warning dialog visibility (used to overlay on card)
  const showWarning = frame >= TIMING.warningDialogIn && frame <= TIMING.warningDialogOutEnd

  return (
    <AbsoluteFill
      style={{
        background: colors.surface.gray50,
        fontFamily: fonts.sans,
        opacity,
      }}
    >
      {/* Main card container */}
      <div
        style={{
          position: 'absolute',
          left: 40,
          right: 40,
          top: 20,
          bottom: 20,
          borderRadius: radius.lg,
          overflow: 'hidden',
          background: colors.surface.white,
          boxShadow: shadows.elevated,
          border: `1px solid ${colors.surface.gray200}`,
          transform: `scale(${entranceScale})`,
          transformOrigin: 'center center',
        }}
      >
        <SettingsPanel
          tierLocalReveal={TIMING.tierLocalReveal}
          tierUkReveal={TIMING.tierUkReveal}
          tierGlobalReveal={TIMING.tierGlobalReveal}
          ukSelectFrame={TIMING.cursorClick1}
          ukExpandFrame={TIMING.ukExpandStart}
          globalSelectFrame={TIMING.cursorClick2}
          globalExpandFrame={TIMING.cursorClick2}
          modelListRevealFrame={TIMING.modelListReveal}
          modelScrollStartFrame={TIMING.modelScrollStart}
          modelScrollEndFrame={TIMING.modelScrollEnd}
        />

        {/* Warning dialog overlay — positioned within the card */}
        {showWarning && (
          <WarningDialog
            enterFrame={TIMING.warningDialogIn}
            bulletStartFrame={TIMING.bulletStart}
            bulletGap={TIMING.bulletGap}
            exitStartFrame={TIMING.warningDialogOutStart}
            exitEndFrame={TIMING.warningDialogOutEnd}
          />
        )}
      </div>

      {/* Animated cursor overlay */}
      <AnimatedCursor
        targets={[
          {
            targetX: TIMING.cursor1X,
            targetY: TIMING.cursor1Y,
            enterFrame: TIMING.cursorEnter1,
            clickFrame: TIMING.cursorClick1,
            exitFrame: TIMING.cursorEnter2,
          },
          {
            targetX: TIMING.cursor2X,
            targetY: TIMING.cursor2Y,
            enterFrame: TIMING.cursorEnter2,
            clickFrame: TIMING.cursorClick2,
            exitFrame: TIMING.loopFadeStart,
          },
        ]}
      />

      {/* beings.com watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 26,
          right: 50,
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
