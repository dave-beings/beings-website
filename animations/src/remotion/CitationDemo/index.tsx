import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { colors, fonts, radius, shadows } from '../../components/marketing/design-tokens'
import { DocumentPanel } from './DocumentPanel'
import { ChatPanel } from './ChatPanel'
import { AnimatedCursor } from './AnimatedCursor'

/**
 * ── TIMING CONFIG ──────────────────────────────────────────
 * All values are frame numbers at 30fps (so 30 = 1 second).
 *
 * Phase 1: Doc panel only        — frames 0–44   (1.5s)
 * Phase 2: Chat slides in        — frames 45–74  (1.0s)
 * Phase 3: Chat text types       — frames 75–196 (4.0s, ~485 chars @ 4/frame)
 * Phase 4: Pause                 — frames 197–214 (0.6s)
 * Phase 5: Cursor enters + click — frames 215–250 (1.2s)
 * Phase 6: Hold highlight        — frames 250–300 (1.7s)
 * Phase 7: Fade + reset          — frames 300–329 (1.0s)
 * ───────────────────────────────────────────────────────────
 */
export const TIMING = {
  // Chat panel reveal (slides in from right)
  chatRevealStart: 45,
  chatRevealEnd: 74,

  // Chat text typing
  typeStart: 80,

  // Cursor movement (after typing completes)
  cursorEnter: 215,
  cursorClick: 245,
  cursorExit: 305,

  // Document panel scroll
  scrollStart: 245,
  scrollEnd: 270,

  // Highlight on source passage
  highlightIn: 250,
  highlightOut: 305,

  // Cursor target position (relative to 800x500 composition)
  cursorTargetX: 595,
  cursorTargetY: 168,
} as const

export const COMPOSITION_WIDTH = 800
export const COMPOSITION_HEIGHT = 500
export const FPS = 30
export const DURATION_IN_FRAMES = 345

export const CitationDemo: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Overall container opacity — fade at the very end for smooth looping
  const loopFade = interpolate(frame, [325, 344], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Subtle entrance fade
  const entranceFade = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Chat panel width animates from 0% to 45%
  const chatReveal = spring({
    frame: frame - TIMING.chatRevealStart,
    fps,
    config: { damping: 200 },
    durationInFrames: TIMING.chatRevealEnd - TIMING.chatRevealStart,
  })
  const chatWidthPercent = interpolate(chatReveal, [0, 1], [0, 45])

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
        <DocumentPanel
          scrollStartFrame={TIMING.scrollStart}
          scrollEndFrame={TIMING.scrollEnd}
          highlightInFrame={TIMING.highlightIn}
          highlightOutFrame={TIMING.highlightOut}
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
              clickFrame={TIMING.cursorClick}
              highlightOutFrame={TIMING.highlightOut}
              typeStartFrame={TIMING.typeStart}
            />
          </div>
        )}
      </div>

      {/* Animated cursor overlay */}
      <AnimatedCursor
        enterFrame={TIMING.cursorEnter}
        clickFrame={TIMING.cursorClick}
        exitFrame={TIMING.cursorExit}
        targetX={TIMING.cursorTargetX}
        targetY={TIMING.cursorTargetY}
      />

      {/* "beings" watermark — very subtle bottom-right */}
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
