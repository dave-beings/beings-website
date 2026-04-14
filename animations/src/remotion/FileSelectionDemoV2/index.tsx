import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { colors, fonts, radius, shadows } from '../../components/marketing/design-tokens'
import { FilesPanel } from './FilesPanel'
import { ChatPanel } from './ChatPanel'
import { AnimatedCursor } from './AnimatedCursor'

/**
 * -- TIMING CONFIG ──────────────────────────────────────────
 * All values are frame numbers at 30fps (so 30 = 1 second).
 *
 * Phase 1: Entrance           -- frames 0--14   (0.5s)
 * Phase 2: Files stagger in   -- frames 15--46  (1.0s)
 * Phase 3: Cursor -> checkbox  -- frames 47--72  (0.8s)
 * Phase 4: Checkbox click     -- frames 73--90  (0.6s)
 * Phase 5: Chat slides in     -- frames 91--135 (1.5s)
 * Phase 6: Cursor -> Summarise -- frames 136--170 (1.1s)
 * Phase 7: Button click       -- frames 171--185 (0.5s)
 * Phase 8: Response streams   -- frames 191--291 (3.3s)
 * Phase 9: Loop fade          -- frames 296--316 (0.7s)
 * ───────────────────────────────────────────────────────────
 */
export const TIMING = {
  // Phase 1: Entrance
  entranceFadeEnd: 14,

  // Phase 2: Files stagger in (header first, then rows 8 frames apart)
  headerAppear: 15,
  rowStartFrame: 22,
  rowStaggerGap: 8,

  // Phase 3--4: Cursor -> checkbox -> click
  cursor1Enter: 47,
  cursor1Click: 73,
  cursor1Exit: 91,
  checkboxClickFrame: 73,

  // Phase 5: Chat panel slides in from right
  chatRevealStart: 91,
  chatRevealEnd: 135,

  // Phase 6--7: Cursor -> Summarise -> click
  cursor2Enter: 136,
  cursor2Click: 171,
  cursor2Exit: 186,
  summariseClickFrame: 171,

  // Phase 8: Response typewriter
  typeStartFrame: 191,

  // Phase 9: Loop fade
  loopFadeStart: 296,
  loopFadeEnd: 316,

  // Cursor targets (composition-space 800x500)
  cursor1TargetX: 718,
  cursor1TargetY: 146,
  cursor2TargetX: 450,
  cursor2TargetY: 458,
} as const

export const COMPOSITION_WIDTH = 800
export const COMPOSITION_HEIGHT = 500
export const FPS = 30
export const DURATION_IN_FRAMES = 316

export const FileSelectionDemoV2: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Phase 1: Entrance fade
  const entranceFade = interpolate(frame, [0, TIMING.entranceFadeEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Phase 9: Loop fade
  const loopFade = interpolate(frame, [TIMING.loopFadeStart, TIMING.loopFadeEnd], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Phase 5: Chat panel width 0% -> 50%
  const chatReveal = spring({
    frame: frame - TIMING.chatRevealStart,
    fps,
    config: { damping: 200 },
    durationInFrames: TIMING.chatRevealEnd - TIMING.chatRevealStart,
  })
  const chatWidthPercent = interpolate(chatReveal, [0, 1], [0, 50])

  return (
    <AbsoluteFill
      style={{
        background: colors.surface.gray50,
        fontFamily: fonts.sans,
        opacity: Math.min(entranceFade, loopFade),
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
          display: 'flex',
          border: `1px solid ${colors.surface.gray200}`,
        }}
      >
        <FilesPanel
          headerAppearFrame={TIMING.headerAppear}
          rowStartFrame={TIMING.rowStartFrame}
          rowStaggerGap={TIMING.rowStaggerGap}
          checkboxClickFrame={TIMING.checkboxClickFrame}
        />
        {chatWidthPercent > 0.5 && (
          <div
            style={{
              width: `${chatWidthPercent}%`,
              height: '100%',
              overflow: 'hidden',
              flexShrink: 0,
              borderLeft: `1px solid ${colors.surface.gray200}`,
            }}
          >
            <ChatPanel
              typeStartFrame={TIMING.typeStartFrame}
              summariseClickFrame={TIMING.summariseClickFrame}
            />
          </div>
        )}
      </div>

      {/* Animated cursor #1: file checkbox click */}
      <AnimatedCursor
        enterFrame={TIMING.cursor1Enter}
        clickFrame={TIMING.cursor1Click}
        exitFrame={TIMING.cursor1Exit}
        targetX={TIMING.cursor1TargetX}
        targetY={TIMING.cursor1TargetY}
      />

      {/* Animated cursor #2: Summarise button click */}
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
