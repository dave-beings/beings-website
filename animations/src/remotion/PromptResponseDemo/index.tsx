import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { colors, fonts, radius, shadows } from '../../components/marketing/design-tokens'
import { ChatContent } from './ChatContent'
import { ActionBar } from './ActionBar'

/**
 * -- TIMING CONFIG --------------------------------------------------
 * All values are frame numbers at 30fps (so 30 = 1 second).
 *
 * Phase 1: Entrance fade       -- frames 0-20    (0.7s)
 * Phase 2: Header appears      -- frames 20-45   (0.8s)
 * Phase 3: User msg slides in  -- frames 50-80   (1.0s)
 * Phase 4: Aida typing         -- frames 85-308  (7.4s, ~890 chars @ 4/frame)
 * Phase 5: Action bar slides   -- frames 320-350 (1.0s)
 * Phase 6: Hold                -- frames 350-395 (1.5s)
 * Phase 7: Loop fade           -- frames 395-419 (0.8s)
 * --------------------------------------------------------------------
 */
export const TIMING = {
  // Header reveal
  headerStart: 20,
  headerEnd: 45,

  // User message slide-in
  userMsgStart: 50,
  userMsgEnd: 80,

  // Aida response typing
  typeStart: 85,

  // Action bar appearance
  actionBarStart: 320,
} as const

export const COMPOSITION_WIDTH = 800
export const COMPOSITION_HEIGHT = 500
export const FPS = 30
export const DURATION_IN_FRAMES = 420

export const PromptResponseDemo: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Entrance fade
  const entranceFade = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Loop fade
  const loopFade = interpolate(frame, [395, 419], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Header opacity (spring reveal)
  const headerProgress = spring({
    frame: frame - TIMING.headerStart,
    fps,
    config: { damping: 200 },
    durationInFrames: TIMING.headerEnd - TIMING.headerStart,
  })

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
          flexDirection: 'column',
          border: `1px solid ${colors.surface.gray200}`,
        }}
      >
        <ChatContent
          headerOpacity={headerProgress}
          userMsgStartFrame={TIMING.userMsgStart}
          userMsgEndFrame={TIMING.userMsgEnd}
          typeStartFrame={TIMING.typeStart}
        />
        <ActionBar appearFrame={TIMING.actionBarStart} />
      </div>

      {/* "beings" watermark */}
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
