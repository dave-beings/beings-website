import { AbsoluteFill, useCurrentFrame, interpolate, Img } from 'remotion'
import { colors, fonts, radius, shadows } from '../../components/marketing/design-tokens'
import { AnimatedCursor } from './AnimatedCursor'
import { TypingOverlay } from './TypingOverlay'
import { UserMessage } from './UserMessage'
import { ResponseStream } from './ResponseStream'

import emptyImg from './assets/interface-empty.png'

/**
 * ── TIMING CONFIG ──────────────────────────────────────────
 * All values are frame numbers at 30fps (so 30 = 1 second).
 *
 * Phase 1: Entrance           — frames 0–29    (1.0s)
 * Phase 2: Cursor enters      — frames 30–69   (1.3s)
 * Phase 3: Click + typing     — frames 70–220  (5.0s)
 * Phase 4: Pause              — frames 221–234 (0.5s)
 * Phase 5: Message sent        — frame 235     blue bubble appears
 * Phase 6: Response streams   — frames 250–380 (4.3s)
 * Phase 7: Loop fade          — frames 390–420 (1.0s)
 * ───────────────────────────────────────────────────────────
 */
export const TIMING = {
  // Phase 1: Entrance
  entranceFadeEnd: 20,

  // Phase 2: Cursor enters
  cursorEnter: 30,

  // Phase 3: Click + typing
  cursorClick: 70,
  typeStart: 78,
  typeEnd: 220,

  // Phase 4: Pause — cursor fades out
  cursorExit: 225,

  // Phase 5: User message appears as sent blue bubble
  messageAppear: 235,

  // Phase 6: Aida response streams in character by character
  streamStart: 250,
  streamEnd: 380,

  // Phase 7: Loop fade
  loopFadeStart: 390,
  loopFadeEnd: 420,

  // Cursor target position (relative to 900x486 composition)
  cursorTargetX: 450,
  cursorTargetY: 400,

  // Typing overlay position (composition-space coords)
  // Layout: left panel ~25%, middle chat panel ~49%, right notes panel ~26%
  typingX: 286,
  typingY: 392,
  typingWidth: 345,

  // User message bubble (card-relative coords, right-aligned in chat panel)
  messageX: 240,
  messageY: 85,
  messageWidth: 390,

  // Aida response stream (card-relative coords, below user message)
  streamX: 230,
  streamY: 145,
  streamWidth: 400,
  streamHeight: 260,
} as const

export const COMPOSITION_WIDTH = 900
export const COMPOSITION_HEIGHT = 486
export const FPS = 30
export const DURATION_IN_FRAMES = 420

export const InterfaceDemo: React.FC = () => {
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

  /* ─── Phase 7: Loop fade ─── */
  const loopFade = interpolate(
    frame,
    [TIMING.loopFadeStart, TIMING.loopFadeEnd],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  const containerOpacity = Math.min(entranceFade, loopFade)

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
        {/* Empty screenshot — stays visible the entire time */}
        <Img
          src={emptyImg}
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

        {/* Sent user message — blue bubble appears after typing ends */}
        <UserMessage
          appearFrame={TIMING.messageAppear}
          fadeOutFrame={TIMING.loopFadeStart}
          x={TIMING.messageX}
          y={TIMING.messageY}
          width={TIMING.messageWidth}
        />

        {/* Aida response — streams in character by character */}
        <ResponseStream
          streamStartFrame={TIMING.streamStart}
          streamEndFrame={TIMING.streamEnd}
          fadeOutFrame={TIMING.loopFadeStart}
          x={TIMING.streamX}
          y={TIMING.streamY}
          width={TIMING.streamWidth}
          maskHeight={TIMING.streamHeight}
        />
      </div>

      {/* Typing overlay — text appears in input area during typing */}
      <TypingOverlay
        typeStartFrame={TIMING.typeStart}
        typeEndFrame={TIMING.typeEnd}
        fadeOutFrame={TIMING.messageAppear}
        x={TIMING.typingX}
        y={TIMING.typingY}
        width={TIMING.typingWidth}
      />

      {/* Animated cursor overlay */}
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
