import { AbsoluteFill, useCurrentFrame, interpolate, Img, Easing } from 'remotion'
import { colors, fonts, radius, shadows } from '../../components/marketing/design-tokens'
import { AnimatedCursor } from './AnimatedCursor'
import { TypingOverlay } from './TypingOverlay'

import orgDropdown from './assets/org-dropdown.png'
import orgSettings from './assets/org-settings.png'

/**
 * ── TIMING CONFIG ──────────────────────────────────────────
 * All values are frame numbers at 30fps (so 30 = 1 second).
 *
 * Phase 1: Entrance fade         — frames 0–14    (0.5s)  fade + scale 0.98->1
 * Phase 2: Cursor enters          — frames 20–58   (1.3s)  glide to PRES row
 * Phase 3: Cursor clicks          — frames 58–73   (0.5s)  pulse + ripple
 * Phase 4: Post-click pause       — frames 73–82   (0.3s)  brief hold
 * Phase 5: Zoom in + blur         — frames 82–112  (1.0s)  scale 1->7x, blur 0->12px
 * Phase 6: Peak blur crossfade    — frames 112–127 (0.5s)  swap images while fully blurred
 * Phase 7: Zoom out + deblur      — frames 127–157 (1.0s)  scale 7x->1, blur 12->0px
 * Phase 8: Typing in description  — frames 167–317 (5.0s)  typewriter + blinking cursor
 * Phase 9: Loop fade              — frames 320–344 (0.8s)  fade to 0
 * ───────────────────────────────────────────────────────────
 */
export const TIMING = {
  // Phase 1: Entrance
  entranceFadeEnd: 14,

  // Phase 2–3: Cursor
  cursorEnter: 20,
  cursorClick: 58,
  cursorExit: 90,

  // Phase 4: Post-click pause ends at zoomInStart
  // Phase 5: Zoom in + blur
  zoomInStart: 82,
  zoomInEnd: 112,

  // Phase 6: Crossfade at peak blur
  crossFadeStart: 112,
  crossFadeEnd: 127,

  // Phase 7: Zoom out + deblur
  zoomOutStart: 127,
  zoomOutEnd: 157,

  // Phase 8: Typing
  typeStart: 167,
  typeEnd: 317,

  // Phase 9: Loop fade
  loopFadeStart: 320,
  loopFadeEnd: 344,

  // Cursor target: the settings cog icon on the PRES row (composition-space, 900x486)
  cursorTargetX: 510,
  cursorTargetY: 375,

  // Zoom origin: match the cog click point
  zoomOriginX: '51%',
  zoomOriginY: '78%',

  // Peak zoom & blur
  peakZoom: 7,
  peakBlur: 12,

  // Typing overlay position (inside the Description textarea content area)
  typingX: 30,
  typingY: 257,
  typingWidth: 840,
  typingHeight: 55,
} as const

export const COMPOSITION_WIDTH = 900
export const COMPOSITION_HEIGHT = 486
export const FPS = 30
export const DURATION_IN_FRAMES = 345

export const OrgSettingsDemo: React.FC = () => {
  const frame = useCurrentFrame()

  /* ─── Phase 1: Entrance fade + subtle scale ─── */
  const entranceFade = interpolate(frame, [0, TIMING.entranceFadeEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const entranceScale = interpolate(frame, [0, TIMING.entranceFadeEnd], [0.98, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  /* ─── Phase 5–7: Zoom scale (piecewise) ─── */
  const zoomIn = interpolate(
    frame,
    [TIMING.zoomInStart, TIMING.zoomInEnd],
    [1, TIMING.peakZoom],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    }
  )
  const zoomOut = interpolate(
    frame,
    [TIMING.zoomOutStart, TIMING.zoomOutEnd],
    [TIMING.peakZoom, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    }
  )
  // Use zoom-in value before crossfade ends, zoom-out value after
  let zoomScale: number
  if (frame < TIMING.zoomInEnd) {
    zoomScale = zoomIn
  } else if (frame < TIMING.zoomOutStart) {
    zoomScale = TIMING.peakZoom // hold at peak during crossfade
  } else {
    zoomScale = zoomOut
  }

  /* ─── Phase 5–7: Blur (mirrors zoom) ─── */
  const blurIn = interpolate(
    frame,
    [TIMING.zoomInStart, TIMING.zoomInEnd],
    [0, TIMING.peakBlur],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    }
  )
  const blurOut = interpolate(
    frame,
    [TIMING.zoomOutStart, TIMING.zoomOutEnd],
    [TIMING.peakBlur, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    }
  )
  let blurAmount: number
  if (frame < TIMING.zoomInEnd) {
    blurAmount = blurIn
  } else if (frame < TIMING.zoomOutStart) {
    blurAmount = TIMING.peakBlur
  } else {
    blurAmount = blurOut
  }

  /* ─── Phase 6: Cross-fade at peak blur ─── */
  const crossFadeProgress = interpolate(
    frame,
    [TIMING.crossFadeStart, TIMING.crossFadeEnd],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )
  const dropdownOpacity = 1 - crossFadeProgress
  const settingsOpacity = crossFadeProgress

  /* ─── Phase 9: Loop fade ─── */
  const loopFade = interpolate(
    frame,
    [TIMING.loopFadeStart, TIMING.loopFadeEnd],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  const containerOpacity = Math.min(entranceFade, loopFade)

  const transformOrigin = `${TIMING.zoomOriginX} ${TIMING.zoomOriginY}`

  return (
    <AbsoluteFill
      style={{
        background: colors.surface.gray50,
        fontFamily: fonts.sans,
        opacity: containerOpacity,
        transform: `scale(${entranceScale})`,
      }}
    >
      {/* Main card container */}
      <div
        style={{
          position: 'absolute',
          inset: 16,
          borderRadius: radius.lg,
          overflow: 'hidden',
          background: colors.surface.white,
          boxShadow: shadows.elevated,
          border: `1px solid ${colors.surface.gray200}`,
        }}
      >
        {/* Image 1: Organisation dropdown — fades out during peak blur crossfade */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: dropdownOpacity,
            transform: `scale(${zoomScale})`,
            transformOrigin,
            filter: `blur(${blurAmount}px)`,
            willChange: 'transform, filter, opacity',
          }}
        >
          <Img
            src={orgDropdown}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top left',
            }}
          />
        </div>

        {/* Image 2: Organisation settings — fades in during peak blur crossfade */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: settingsOpacity,
            transform: `scale(${zoomScale})`,
            transformOrigin,
            filter: `blur(${blurAmount}px)`,
            willChange: 'transform, filter, opacity',
          }}
        >
          <Img
            src={orgSettings}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top left',
            }}
          />
          {/* Typing overlay INSIDE the settings wrapper so it inherits blur/zoom.
              The white mask is invisible while blurred, then resolves with the image. */}
          <TypingOverlay
            maskStartFrame={TIMING.crossFadeStart}
            typeStartFrame={TIMING.typeStart}
            typeEndFrame={TIMING.typeEnd}
            x={TIMING.typingX}
            y={TIMING.typingY}
            width={TIMING.typingWidth}
            height={TIMING.typingHeight}
          />
        </div>
      </div>

      {/* Animated cursor — enters, clicks PRES row, fades during early zoom */}
      <AnimatedCursor
        enterFrame={TIMING.cursorEnter}
        clickFrame={TIMING.cursorClick}
        exitFrame={TIMING.cursorExit}
        targetX={TIMING.cursorTargetX}
        targetY={TIMING.cursorTargetY}
      />

      {/* beings.com watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 22,
          right: 26,
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
