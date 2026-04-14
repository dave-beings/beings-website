import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { colors, fonts, radius, shadows } from '../../components/marketing/design-tokens'
import { StorageHeader } from './StorageHeader'
import { FileTable } from './FileTable'
import { AnimatedCursor } from './AnimatedCursor'

/**
 * ── TIMING CONFIG ──────────────────────────────────────────
 * All values are frame numbers at 30fps (so 30 = 1 second).
 *
 * Phase 1: Card + header       — frames 0–44    (1.5s)  Card slides up, title + search appear
 * Phase 2: Table header        — frames 30–50   (0.67s) Column labels fade in
 * Phase 3: Row 1               — frames 55–67   (0.4s)  user_research_summary.pdf slides in
 * Phase 4: Row 2               — frames 85–97   (0.4s)  Interview Transcripts slides in
 * Phase 5: Row 3               — frames 115–127 (0.4s)  Participant Interview Transcripts slides in
 * Phase 6: Stats count up      — frames 145–195 (1.67s) "204 mins | 39260 words | 10 sources" animate
 * Phase 7: Cursor + click      — frames 210–255 (1.5s)  Cursor enters, clicks search bar
 * Phase 8: Hold + loop fade    — frames 255–310 (1.83s) Hold, then fade to 0 for seamless loop
 *
 * Total: 310 frames at 30fps = ~10.3 seconds
 * ───────────────────────────────────────────────────────────
 */
export const TIMING = {
  // Card + header entrance
  cardEnterStart: 0,
  titleAppear: 8,

  // Table header
  tableHeaderStart: 30,
  tableHeaderEnd: 50,

  // Row stagger
  row1Start: 55,
  row2Start: 85,
  row3Start: 115,
  rowSlideDuration: 12,

  // Stats counter animation
  statsStart: 145,
  statsEnd: 195,

  // Cursor movement
  cursorEnter: 210,
  cursorClick: 240,
  cursorExit: 280,

  // Cursor target — search bar position (composition-space pixels)
  cursorTargetX: 120,
  cursorTargetY: 98,

  // Search bar focus aligns with cursor click
  searchFocusFrame: 240,
} as const

export const COMPOSITION_WIDTH = 800
export const COMPOSITION_HEIGHT = 500
export const FPS = 30
export const DURATION_IN_FRAMES = 310

export const FileStorageDemo: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Overall container opacity — fade at the very end for smooth looping
  const loopFade = interpolate(frame, [290, 310], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Subtle entrance fade
  const entranceFade = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Card slide-up entrance
  const cardSlide = spring({
    frame: frame - TIMING.cardEnterStart,
    fps,
    config: { damping: 200 },
    durationInFrames: 25,
  })
  const cardTranslateY = interpolate(cardSlide, [0, 1], [20, 0])

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
          transform: `translateY(${cardTranslateY}px)`,
        }}
      >
        <StorageHeader
          titleAppearFrame={TIMING.titleAppear}
          statsStartFrame={TIMING.statsStart}
          statsEndFrame={TIMING.statsEnd}
          searchFocusFrame={TIMING.searchFocusFrame}
        />
        <FileTable
          headerStartFrame={TIMING.tableHeaderStart}
          headerEndFrame={TIMING.tableHeaderEnd}
          row1Start={TIMING.row1Start}
          row2Start={TIMING.row2Start}
          row3Start={TIMING.row3Start}
          rowSlideDuration={TIMING.rowSlideDuration}
        />
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
