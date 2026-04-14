import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { colors, fonts, radius, shadows } from '../../components/marketing/design-tokens'
import { ChatPreferencesPanel } from './ChatPreferencesPanel'
import { IdentityPanel } from './IdentityPanel'
import { AnimatedCursor } from './AnimatedCursor'
import { DropdownCursor } from './DropdownCursor'

/**
 * ── TIMING CONFIG ──────────────────────────────────────────
 * All values are frame numbers at 30fps (so 30 = 1 second).
 *
 * Phase 1: Modal fade in              — frames 0–20    (0.7s)
 * Phase 2: Typewriter fills textarea   — frames 30–90   (2.0s)
 * Phase 3: Cog button springs in      — frames 100–120  (0.7s)
 * Phase 4: Cursor enters → clicks cog — frames 130–155  (0.8s)
 * Phase 5: Cross-fade to identity     — frames 160–185  (0.8s)
 * Phase 6: Cursor clicks dropdown     — frames 195–215  (0.7s)
 * Phase 7: Dropdown opens             — frames 215–235  (0.7s)
 * Phase 8: Cursor hovers options      — frames 240–290  (1.7s)
 * Phase 9: Hold for readability       — frames 290–360  (2.3s)
 * Phase 10: Loop fade out             — frames 360–380  (0.7s)
 * ───────────────────────────────────────────────────────────
 */
export const TIMING = {
  // Phase 1: Modal entrance
  modalFadeEnd: 20,

  // Phase 2: Typewriter
  typewriterStart: 30,
  typewriterEnd: 90,

  // Phase 3: Cog button
  cogAppearFrame: 100,

  // Phase 4: Cursor → click cog
  cursorEnter: 130,
  cursorClick: 150,
  cursorExit: 160,

  // Phase 5: Cross-fade transition
  crossFadeStart: 160,
  crossFadeEnd: 185,

  // Phase 6: Identity panel appears + second cursor enters
  identityEnterFrame: 165,
  dropdownCursorEnter: 195,
  dropdownClickFrame: 212,

  // Phase 7: Dropdown opens on click
  dropdownOpenFrame: 212,

  // Phase 8: Cursor hovers through options
  hoverOption1Frame: 235,
  hoverOption2Frame: 255,
  hoverOption3Frame: 275,
  dropdownCursorExit: 310,

  // Phase 9: Hold
  holdEnd: 360,

  // Phase 10: Loop fade
  loopFadeStart: 360,
  loopFadeEnd: 380,

  // Cursor targets (composition-space pixels, 600×550)
  cogTargetX: 500,
  cogTargetY: 58,

  // Dropdown click target (chevron area of the select)
  dropdownTargetX: 490,
  dropdownTargetY: 158,

  // Option hover targets (center of each option row)
  option1X: 300,
  option1Y: 201,
  option2X: 300,
  option2Y: 239,
  option3X: 300,
  option3Y: 277,
} as const

export const COMPOSITION_WIDTH = 600
export const COMPOSITION_HEIGHT = 550
export const FPS = 30
export const DURATION_IN_FRAMES = 380

export const CustomInstructionsDemo: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // ── Overall container fades ──
  const entranceFade = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const loopFade = interpolate(
    frame,
    [TIMING.loopFadeStart, TIMING.loopFadeEnd],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  // ── Phase 1: Modal entrance ──
  const modalSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: TIMING.modalFadeEnd,
  })
  const modalScale = interpolate(modalSpring, [0, 1], [0.95, 1])
  const modalOpacity = interpolate(modalSpring, [0, 1], [0, 1])

  // ── Phase 5: Cross-fade ──
  const chatPanelOpacity = interpolate(
    frame,
    [TIMING.crossFadeStart, TIMING.crossFadeEnd],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )
  const identityPanelOpacity = interpolate(
    frame,
    [TIMING.crossFadeStart, TIMING.crossFadeEnd],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  const showIdentity = frame >= TIMING.crossFadeStart

  // Dropdown cursor waypoints
  const dropdownWaypoints = [
    { frame: TIMING.dropdownClickFrame, x: TIMING.dropdownTargetX, y: TIMING.dropdownTargetY, click: true },
    { frame: TIMING.hoverOption1Frame, x: TIMING.option1X, y: TIMING.option1Y },
    { frame: TIMING.hoverOption2Frame, x: TIMING.option2X, y: TIMING.option2Y },
    { frame: TIMING.hoverOption3Frame, x: TIMING.option3X, y: TIMING.option3Y },
  ]

  return (
    <AbsoluteFill
      style={{
        background: colors.surface.gray50,
        fontFamily: fonts.sans,
        opacity: Math.min(entranceFade, loopFade),
      }}
    >
      {/* Modal card container */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: 40,
          right: 40,
          bottom: 24,
          borderRadius: radius.lg,
          overflow: 'hidden',
          background: colors.surface.white,
          boxShadow: shadows.elevated,
          border: `1px solid ${colors.surface.gray200}`,
          transform: `scale(${modalScale})`,
          opacity: modalOpacity,
        }}
      >
        {/* Chat Preferences panel (initial state) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: chatPanelOpacity,
            pointerEvents: showIdentity ? 'none' : 'auto',
          }}
        >
          <ChatPreferencesPanel
            typewriterStart={TIMING.typewriterStart}
            typewriterEnd={TIMING.typewriterEnd}
            cogAppearFrame={TIMING.cogAppearFrame}
            exitFrame={TIMING.crossFadeStart}
          />
        </div>

        {/* Identity panel (after cog click) */}
        {showIdentity && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: identityPanelOpacity,
            }}
          >
            <IdentityPanel
              enterFrame={TIMING.identityEnterFrame}
              dropdownOpenFrame={TIMING.dropdownOpenFrame}
              hoverFrames={[
                TIMING.hoverOption1Frame,
                TIMING.hoverOption2Frame,
                TIMING.hoverOption3Frame,
              ]}
            />
          </div>
        )}
      </div>

      {/* Cursor 1: clicks the cog button */}
      <AnimatedCursor
        enterFrame={TIMING.cursorEnter}
        clickFrame={TIMING.cursorClick}
        exitFrame={TIMING.cursorExit}
        targetX={TIMING.cogTargetX}
        targetY={TIMING.cogTargetY}
      />

      {/* Cursor 2: clicks dropdown + hovers options */}
      <DropdownCursor
        enterFrame={TIMING.dropdownCursorEnter}
        exitFrame={TIMING.dropdownCursorExit}
        waypoints={dropdownWaypoints}
      />

      {/* "beings" watermark — subtle bottom-right */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
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
