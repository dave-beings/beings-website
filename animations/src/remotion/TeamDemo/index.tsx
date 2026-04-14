import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { colors, fonts, radius, shadows } from '../../components/marketing/design-tokens'
import { OrgModal } from './OrgModal'
import { InviteModal } from './InviteModal'
import { AnimatedCursor } from './AnimatedCursor'

/**
 * ── TIMING CONFIG ──────────────────────────────────────────
 * All values are frame numbers at 30fps (so 30 = 1 second).
 *
 * Phase 1: Create Organisation    — frames 0–120  (4.0s)
 *   Modal fades in, cursor clicks input, types org name,
 *   cursor clicks "Create Organisation" button
 *
 * Phase 2: Transition             — frames 121–150 (1.0s)
 *   Modal content crossfades to "Invite Members" state
 *
 * Phase 3: First Invites          — frames 151–240 (3.0s)
 *   Two email chips type in one at a time
 *
 * Phase 4: Unlimited Growth       — frames 241–340 (3.3s)
 *   Four more chips stagger in quickly, cursor clicks Send
 *
 * Phase 5: Loop Fade              — frames 341–389 (1.6s)
 *   Success pulse, fade to 0 for seamless loop
 * ───────────────────────────────────────────────────────────
 */
export const TIMING = {
  // Phase 1: Create Organisation
  orgModalIn: 0,
  cursorToInput: 30,
  cursorClickInput: 50,
  typeOrgNameStart: 55,
  typeOrgNameEnd: 75, // ~24 chars at 1.2/frame = 20 frames
  cursorToCreateBtn: 85,
  cursorClickCreate: 100,

  // Phase 2: Crossfade transition
  orgFadeOut: 121,
  inviteFadeIn: 130,

  // Phase 3: First typed invites
  firstChipStart: 155,
  chipTypingInterval: 42, // frames between each typed chip

  // Phase 4: Stagger chips + send
  staggerStart: 250,
  staggerInterval: 15,
  cursorToSendBtn: 300,
  cursorClickSend: 325,

  // Phase 5: Success + loop fade
  successPulse: 330,
  loopFadeStart: 370,
  loopFadeEnd: 389,

  // Cursor target positions (composition-space: 800x500)
  inputTargetX: 340,
  inputTargetY: 230,
  createBtnTargetX: 590,
  createBtnTargetY: 390,
  emailInputTargetX: 300,
  emailInputTargetY: 230,
  sendBtnTargetX: 580,
  sendBtnTargetY: 390,
} as const

export const COMPOSITION_WIDTH = 800
export const COMPOSITION_HEIGHT = 500
export const FPS = 30
export const DURATION_IN_FRAMES = 390

export const TeamDemo: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Entrance fade (first 15 frames)
  const entranceFade = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Loop fade (last ~20 frames)
  const loopFade = interpolate(
    frame,
    [TIMING.loopFadeStart, TIMING.loopFadeEnd],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  // Modal card entrance scale
  const cardEntrance = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  })
  const cardScale = interpolate(cardEntrance, [0, 1], [0.96, 1])

  // Phase 1 → Phase 2 crossfade: org modal fades out
  const orgOpacity = interpolate(
    frame,
    [TIMING.orgFadeOut, TIMING.orgFadeOut + 15],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  // Success pulse glow on the card after send is clicked
  const successGlow = frame >= TIMING.successPulse
    ? spring({
        frame: frame - TIMING.successPulse,
        fps,
        config: { damping: 20, stiffness: 150 },
      })
    : 0
  const successGlowOpacity = frame >= TIMING.successPulse
    ? interpolate(
        frame,
        [TIMING.successPulse, TIMING.successPulse + 30],
        [0.3, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 0

  // Cursor targets
  const cursorTargets = [
    {
      targetX: TIMING.inputTargetX,
      targetY: TIMING.inputTargetY,
      enterFrame: TIMING.cursorToInput,
      clickFrame: TIMING.cursorClickInput,
      exitFrame: TIMING.cursorClickInput + 10,
    },
    {
      targetX: TIMING.createBtnTargetX,
      targetY: TIMING.createBtnTargetY,
      enterFrame: TIMING.cursorToCreateBtn,
      clickFrame: TIMING.cursorClickCreate,
      exitFrame: TIMING.cursorClickCreate + 15,
    },
    {
      targetX: TIMING.emailInputTargetX,
      targetY: TIMING.emailInputTargetY,
      enterFrame: TIMING.inviteFadeIn + 15,
      clickFrame: TIMING.inviteFadeIn + 25,
      exitFrame: TIMING.cursorToSendBtn - 5,
    },
    {
      targetX: TIMING.sendBtnTargetX,
      targetY: TIMING.sendBtnTargetY,
      enterFrame: TIMING.cursorToSendBtn,
      clickFrame: TIMING.cursorClickSend,
      exitFrame: TIMING.cursorClickSend + 20,
    },
  ]

  return (
    <AbsoluteFill
      style={{
        background: colors.surface.gray50,
        fontFamily: fonts.sans,
        opacity: Math.min(entranceFade, loopFade),
      }}
    >
      {/* Main modal card */}
      <div
        style={{
          position: 'absolute',
          left: 120,
          right: 120,
          top: 40,
          bottom: 40,
          borderRadius: radius.lg,
          overflow: 'hidden',
          background: colors.surface.white,
          boxShadow: successGlowOpacity > 0
            ? `${shadows.elevated}, 0 0 40px rgba(4, 156, 240, ${successGlowOpacity})`
            : shadows.elevated,
          border: `1px solid ${colors.surface.gray200}`,
          transform: `scale(${cardScale})`,
        }}
      >
        {/* Phase 1: Create Organisation */}
        {orgOpacity > 0 && (
          <OrgModal
            typeStartFrame={TIMING.typeOrgNameStart}
            typeEndFrame={TIMING.typeOrgNameEnd}
            opacity={orgOpacity}
            buttonClickFrame={TIMING.cursorClickCreate}
          />
        )}

        {/* Phase 2+: Invite Members */}
        {frame >= TIMING.inviteFadeIn - 5 && (
          <InviteModal
            fadeInFrame={TIMING.inviteFadeIn}
            firstChipFrame={TIMING.firstChipStart}
            chipTypingInterval={TIMING.chipTypingInterval}
            staggerStartFrame={TIMING.staggerStart}
            staggerInterval={TIMING.staggerInterval}
            sendClickFrame={TIMING.cursorClickSend}
          />
        )}
      </div>

      {/* Animated cursor overlay */}
      <AnimatedCursor targets={cursorTargets} />

      {/* "beings.com" watermark */}
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
