import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion'
import { colors, fonts, radius, shadows } from '../../components/marketing/design-tokens'
import { AnimatedCursor } from './AnimatedCursor'
import { ResponseStream } from './ResponseStream'
import { FileHighlight } from './FileHighlight'
import { ButtonHighlight } from './ButtonHighlight'

import emptyImg from '../InterfaceDemo/assets/interface-empty.png'

/**
 * ── TIMING CONFIG ──────────────────────────────────────────
 * All values are frame numbers at 30fps (so 30 = 1 second).
 *
 * Phase 1: Entrance           — frames 0–19    (0.7s)
 * Phase 2: Files visible      — frames 20–59   (1.3s)
 * Phase 3: Cursor → file      — frames 60–99   (1.3s)
 * Phase 4: File click          — frames 100–119 (0.7s)
 * Phase 5: Chat reveals       — frames 120–164 (1.5s)
 * Phase 6: Cursor → Summarise — frames 165–204 (1.3s)
 * Phase 7: Button click       — frames 205–219 (0.5s)
 * Phase 8: Response streams   — frames 225–335 (3.7s)
 * Phase 9: Loop fade          — frames 340–360 (0.7s)
 * ───────────────────────────────────────────────────────────
 */
export const TIMING = {
  // Phase 1: Entrance
  entranceFadeEnd: 19,

  // Phase 3: Cursor enters → moves to file row
  cursor1Enter: 60,
  cursor1Click: 100,
  cursor1Exit: 120,

  // Phase 4: File highlight
  fileHighlightFrame: 100,

  // Phase 5: Chat panel reveals via clip expansion
  chatRevealStart: 120,
  chatRevealEnd: 164,

  // Phase 6: Cursor enters → moves to Summarise button
  cursor2Enter: 165,
  cursor2Click: 205,
  cursor2Exit: 225,

  // Phase 7: Button highlight
  buttonHighlightFrame: 205,

  // Phase 8: Response streams in
  streamStart: 225,
  streamEnd: 335,

  // Phase 9: Loop fade
  loopFadeStart: 340,
  loopFadeEnd: 360,

  // ── Cursor targets (composition-space) ──
  cursor1TargetX: 125,
  cursor1TargetY: 190,

  cursor2TargetX: 495,
  cursor2TargetY: 448,

  // ── File highlight (card-relative) ──
  fileHighlightX: 8,
  fileHighlightY: 155,
  fileHighlightWidth: 205,
  fileHighlightHeight: 36,

  // ── Button highlight (card-relative) ──
  buttonHighlightX: 440,
  buttonHighlightY: 426,
  buttonHighlightWidth: 85,
  buttonHighlightHeight: 28,

  // ── Response stream (card-relative) ──
  streamX: 230,
  streamY: 120,
  streamWidth: 400,
  streamHeight: 280,

  // ── Clip widths (percentage of card) ──
  clipStartPct: 25,
  clipEndPct: 74,
} as const

export const COMPOSITION_WIDTH = 900
export const COMPOSITION_HEIGHT = 486
export const FPS = 30
export const DURATION_IN_FRAMES = 360

const CARD_WIDTH = COMPOSITION_WIDTH - 32  // 868
const CARD_HEIGHT = COMPOSITION_HEIGHT - 32 // 454

export const FileSelectionDemo: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  /* ─── Phase 1: Entrance fade + subtle scale ─── */
  const entranceFade = interpolate(frame, [0, TIMING.entranceFadeEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const entranceScale = interpolate(frame, [0, TIMING.entranceFadeEnd], [0.98, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  /* ─── Phase 5: Clip width animation ─── */
  const clipSpring = spring({
    frame: Math.max(0, frame - TIMING.chatRevealStart),
    fps,
    config: { damping: 200 },
    durationInFrames: TIMING.chatRevealEnd - TIMING.chatRevealStart,
  })

  const clipStartWidth = CARD_WIDTH * (TIMING.clipStartPct / 100)
  const clipEndWidth = CARD_WIDTH * (TIMING.clipEndPct / 100)
  const clipWidth = interpolate(clipSpring, [0, 1], [clipStartWidth, clipEndWidth])

  /* ─── Phase 9: Loop fade ─── */
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
        {/* Clip container — animated width reveals files → files+chat */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: clipWidth,
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <Img
            src={emptyImg}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              objectFit: 'cover',
              objectPosition: 'top left',
            }}
          />
        </div>

        {/* File row highlight — appears on click */}
        <FileHighlight
          appearFrame={TIMING.fileHighlightFrame}
          fadeOutFrame={TIMING.loopFadeStart}
          x={TIMING.fileHighlightX}
          y={TIMING.fileHighlightY}
          width={TIMING.fileHighlightWidth}
          height={TIMING.fileHighlightHeight}
        />

        {/* Button highlight — brief pulse on Summarise click */}
        <ButtonHighlight
          clickFrame={TIMING.buttonHighlightFrame}
          x={TIMING.buttonHighlightX}
          y={TIMING.buttonHighlightY}
          width={TIMING.buttonHighlightWidth}
          height={TIMING.buttonHighlightHeight}
        />

        {/* Aida response — streams in after Summarise click */}
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

      {/* Animated cursor #1 — file click */}
      <AnimatedCursor
        enterFrame={TIMING.cursor1Enter}
        clickFrame={TIMING.cursor1Click}
        exitFrame={TIMING.cursor1Exit}
        targetX={TIMING.cursor1TargetX}
        targetY={TIMING.cursor1TargetY}
      />

      {/* Animated cursor #2 — Summarise button click */}
      <AnimatedCursor
        enterFrame={TIMING.cursor2Enter}
        clickFrame={TIMING.cursor2Click}
        exitFrame={TIMING.cursor2Exit}
        targetX={TIMING.cursor2TargetX}
        targetY={TIMING.cursor2TargetY}
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
