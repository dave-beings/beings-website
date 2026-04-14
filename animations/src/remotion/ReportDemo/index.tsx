import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { colors, fonts, radius, shadows } from '../../components/marketing/design-tokens'
import { ReportBody } from './ReportBody'

/**
 * ── TIMING CONFIG ──────────────────────────────────────────
 * All values are frame numbers at 30fps (so 30 = 1 second).
 *
 * ~1400 chars total at 3 chars/frame = ~467 frames of typing.
 * Typing starts at frame 60, ends around frame 527.
 * Total duration: ~19s (570 frames).
 *
 * Phase 1: Modal fade in        — frames 0–25   (0.8s)
 * Phase 2: Report title          — frames 30–55  (0.8s)
 * Phase 3: All text types        — frames 60–527 (~15.6s)
 *   (intro → sec1 heading → sec1 body → sec2 heading → sec2 body → sec3 heading)
 *   Scroll kicks in around sec3 start (~frame 440)
 * Phase 4: Toolbar + Saved       — frames 530–555 (0.8s)
 * Phase 5: Hold                  — frames 555–590 (1.2s)
 * Phase 6: Fade out              — frames 590–609 (0.7s)
 * ───────────────────────────────────────────────────────────
 */
export const TIMING = {
  // Modal entrance
  modalFadeEnd: 25,

  // Report title
  titleStart: 30,
  titleEnd: 55,

  // Typewriter starts (all text types sequentially)
  introStart: 60,

  // Approximate frame where section 3 begins typing (for scroll trigger)
  // ~1200 chars before sec3 heading / 3 chars per frame + 60 offset ≈ 460
  section3Start: 460,

  // Toolbar + footer
  toolbarStart: 530,
  savedStart: 545,

  // Loop fade
  fadeOutStart: 590,
} as const

export const COMPOSITION_WIDTH = 600
export const COMPOSITION_HEIGHT = 550
export const FPS = 30
export const DURATION_IN_FRAMES = 610

const REPORT_TITLE = 'Patient Experience: Clarity, Respect, Flexibility'

// ── Toolbar icons (simplified SVG-like representations) ──────

const ToolbarButton: React.FC<{
  label: string
  bold?: boolean
  width?: number
}> = ({ label, bold, width }) => (
  <div
    style={{
      fontFamily: fonts.sans,
      fontSize: 9,
      fontWeight: bold ? 700 : 500,
      color: colors.text.secondary,
      padding: '2px 6px',
      borderRadius: 3,
      background: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: width ?? 'auto',
      fontStyle: label === 'I' ? 'italic' : 'normal',
      textDecoration: label === 'U' ? 'underline' : label === 'S' ? 'line-through' : 'none',
    }}
  >
    {label}
  </div>
)

const ToolbarSeparator: React.FC = () => (
  <div
    style={{
      width: 1,
      height: 14,
      background: colors.surface.gray200,
      margin: '0 4px',
    }}
  />
)

// ── Main ReportDemo composition ──────────────────────────────

export const ReportDemo: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // ─ Entrance: scale 0.95→1 + opacity 0→1
  const entranceProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: TIMING.modalFadeEnd,
  })
  const entranceScale = interpolate(entranceProgress, [0, 1], [0.95, 1])
  const entranceOpacity = interpolate(entranceProgress, [0, 1], [0, 1])

  // ─ Loop fade out (last 20 frames)
  const loopFade = interpolate(
    frame,
    [TIMING.fadeOutStart, DURATION_IN_FRAMES - 1],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  // ─ Report title fade in
  const titleProgress = spring({
    frame: frame - TIMING.titleStart,
    fps,
    config: { damping: 200 },
    durationInFrames: TIMING.titleEnd - TIMING.titleStart,
  })
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1])
  const titleSlideY = interpolate(titleProgress, [0, 1], [4, 0])

  // ─ Toolbar height animation
  const toolbarProgress = spring({
    frame: frame - TIMING.toolbarStart,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  })
  const toolbarHeight = interpolate(toolbarProgress, [0, 1], [0, 62])

  // ─ "Saved" indicator
  const savedOpacity = interpolate(
    frame,
    [TIMING.savedStart, TIMING.savedStart + 12],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  return (
    <AbsoluteFill
      style={{
        background: colors.surface.gray50,
        fontFamily: fonts.sans,
        opacity: Math.min(entranceOpacity, loopFade),
      }}
    >
      {/* Modal card */}
      <div
        style={{
          position: 'absolute',
          left: 30,
          right: 30,
          top: 16,
          bottom: 16,
          borderRadius: radius.lg,
          overflow: 'hidden',
          background: colors.surface.white,
          boxShadow: shadows.elevated,
          border: `1px solid ${colors.surface.gray200}`,
          display: 'flex',
          flexDirection: 'column',
          transform: `scale(${entranceScale})`,
        }}
      >
        {/* ── Title bar ─────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderBottom: `1px solid ${colors.surface.gray200}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: fonts.sans,
              fontSize: 13,
              fontWeight: 600,
              color: colors.text.primary,
              opacity: titleOpacity,
              transform: `translateY(${titleSlideY}px)`,
              lineHeight: 1.3,
              flex: 1,
              paddingRight: 12,
            }}
          >
            {REPORT_TITLE}
          </div>
          {/* Close button icon */}
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: colors.text.muted,
              fontSize: 14,
              fontWeight: 300,
            }}
          >
            {'\u2715'}
          </div>
        </div>

        {/* ── Report body (typewriter content) ──────── */}
        <ReportBody
          introStartFrame={TIMING.introStart}
          section3StartFrame={TIMING.section3Start}
        />

        {/* ── Toolbar + footer (slides in from bottom) ── */}
        <div
          style={{
            height: toolbarHeight,
            overflow: 'hidden',
            flexShrink: 0,
            borderTop: toolbarHeight > 1 ? `1px solid ${colors.surface.gray200}` : 'none',
          }}
        >
          {/* Rich text toolbar row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '5px 14px',
              gap: 2,
              borderBottom: `1px solid ${colors.surface.gray200}`,
            }}
          >
            <ToolbarButton label="Paragraph" width={56} />
            <ToolbarSeparator />
            <ToolbarButton label="14" />
            <span style={{ fontSize: 8, color: colors.text.muted, marginRight: 2 }}>px</span>
            <ToolbarSeparator />
            <ToolbarButton label="B" bold />
            <ToolbarButton label="I" />
            <ToolbarButton label="U" />
            <ToolbarButton label="S" />
            <ToolbarSeparator />
            {/* List icons */}
            <ToolbarButton label={'\u2261'} />
            <ToolbarButton label={'\u2630'} />
            <ToolbarSeparator />
            {/* Alignment */}
            <ToolbarButton label={'\u2261'} />
            <ToolbarSeparator />
            {/* Link / image */}
            <ToolbarButton label={'\uD83D\uDD17'} />
          </div>

          {/* Footer row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 14px',
            }}
          >
            {/* Saved indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                opacity: savedOpacity,
              }}
            >
              <span style={{ color: '#22C55E', fontSize: 11 }}>{'\u2713'}</span>
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 9,
                  fontWeight: 500,
                  color: '#22C55E',
                }}
              >
                Saved
              </span>
            </div>

            {/* Right side buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 4,
                  background: colors.surface.gray100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: fonts.sans,
                  fontSize: 11,
                  fontWeight: 700,
                  color: colors.text.secondary,
                }}
              >
                A
              </div>
              <div
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 9,
                  fontWeight: 600,
                  color: colors.surface.white,
                  background: colors.brand.primary,
                  padding: '4px 10px',
                  borderRadius: 4,
                }}
              >
                Convert to Source
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* "beings" watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 22,
          right: 36,
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
