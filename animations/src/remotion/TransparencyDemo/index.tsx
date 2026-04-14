import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { colors, fonts, radius, shadows } from '../../components/marketing/design-tokens'
import { ChatPanel } from './ChatPanel'
import { AnimatedCursor } from './AnimatedCursor'

/**
 * ── TIMING CONFIG ──────────────────────────────────────────
 * All values are frame numbers at 30fps (so 30 = 1 second).
 *
 * Phase 1: Fade in layout          — frames 0–20    (0.7s)
 * Phase 2: User message appears    — frames 25–70   (1.5s)
 * Phase 3: Aida response typewriter— frames 75–160  (2.8s)
 * Phase 4: Metrics reveal          — frames 165–240 (2.5s)
 * Phase 5: Cursor → System Context — frames 245–290 (1.5s)
 * Phase 6: Accordion expand + hold — frames 295–370 (2.5s)
 * Phase 7: Fade out for loop       — frames 400–419 (0.7s)
 * ───────────────────────────────────────────────────────────
 */
export const TIMING = {
  // Phase 1: Layout entrance
  entranceFadeEnd: 20,

  // Phase 2: User message bubble
  userMessageIn: 25,
  userMessageEnd: 50,

  // Phase 3: Aida response typing
  typeStart: 75,

  // Phase 4: Metrics reveal (token counters, processing time, model)
  metricsRevealStart: 165,
  tokenCountEnd: 220,
  processingInfoIn: 200,
  modelInfoIn: 215,

  // Phase 5: Cursor enters and clicks System Context
  cursorEnter: 245,
  cursorClick: 275,
  cursorExit: 340,

  // Phase 6: System Context accordion expand
  accordionExpandStart: 280,

  // Phase 7: Loop fade
  loopFadeStart: 400,
  loopFadeEnd: 419,

  // Cursor target (composition-space: 800x500)
  // Targets the "System Context" accordion header in the chat panel
  cursorTargetX: 130,
  cursorTargetY: 298,
} as const

export const COMPOSITION_WIDTH = 800
export const COMPOSITION_HEIGHT = 500
export const FPS = 30
export const DURATION_IN_FRAMES = 420

export const TransparencyDemo: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Phase 1: Entrance fade
  const entranceFade = interpolate(frame, [0, TIMING.entranceFadeEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Phase 7: Loop fade out
  const loopFade = interpolate(frame, [TIMING.loopFadeStart, TIMING.loopFadeEnd], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Entrance scale
  const entranceScale = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: TIMING.entranceFadeEnd,
  })
  const scale = interpolate(entranceScale, [0, 1], [0.96, 1])

  return (
    <AbsoluteFill
      style={{
        background: colors.surface.gray50,
        fontFamily: fonts.sans,
        opacity: Math.min(entranceFade, loopFade),
      }}
    >
      {/* Main card container — three-panel layout */}
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
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Chat panel — ~50% width */}
        <div
          style={{
            width: '50%',
            height: '100%',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <ChatPanel />
        </div>

        {/* Document panel — ~25% width (static placeholder) */}
        <div
          style={{
            width: '25%',
            height: '100%',
            borderLeft: `1px solid ${colors.surface.gray200}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Document header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 12px',
              borderBottom: `1px solid ${colors.surface.gray200}`,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: 10,
                fontWeight: 600,
                color: colors.text.primary,
              }}
            >
              Document
            </span>
          </div>
          {/* Empty document area */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: 9,
                color: colors.text.muted,
              }}
            >
              No document selected
            </span>
          </div>
        </div>

        {/* Files panel — ~25% width (static placeholder) */}
        <div
          style={{
            width: '25%',
            height: '100%',
            borderLeft: `1px solid ${colors.surface.gray200}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Files header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 12px',
              borderBottom: `1px solid ${colors.surface.gray200}`,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: 10,
                fontWeight: 600,
                color: colors.text.primary,
              }}
            >
              Files
            </span>
          </div>
          {/* Empty files area */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: 9,
                color: colors.text.muted,
              }}
            >
              No files uploaded
            </span>
          </div>
        </div>
      </div>

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
