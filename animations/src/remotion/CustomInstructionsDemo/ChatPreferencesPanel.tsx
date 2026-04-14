import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { colors, fonts, radius } from '../../components/marketing/design-tokens'

const TYPEWRITER_TEXT =
  'Focus only on statements made by Participants. Highlight any contradictions.'

const CHARS_PER_FRAME = 2

const PROMPT_PILLS = ['Basic', 'Collaborative', 'Thematic']

interface ChatPreferencesPanelProps {
  typewriterStart: number
  typewriterEnd: number
  cogAppearFrame: number
  exitFrame: number
}

export const ChatPreferencesPanel: React.FC<ChatPreferencesPanelProps> = ({
  typewriterStart,
  typewriterEnd,
  cogAppearFrame,
  exitFrame,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Typewriter progress
  const elapsed = Math.max(0, frame - typewriterStart)
  const totalCharsTyped = Math.min(
    TYPEWRITER_TEXT.length,
    Math.floor(elapsed * CHARS_PER_FRAME)
  )
  const typedText = TYPEWRITER_TEXT.slice(0, totalCharsTyped)
  const isTyping = frame >= typewriterStart && totalCharsTyped < TYPEWRITER_TEXT.length

  // Blinking cursor
  const cursorOpacity = interpolate(frame % 16, [0, 8, 16], [1, 0, 1])

  // Cog button spring entrance
  const cogProgress = spring({
    frame: frame - cogAppearFrame,
    fps,
    config: { damping: 15, stiffness: 200 },
  })
  const cogScale = frame >= cogAppearFrame
    ? interpolate(cogProgress, [0, 1], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0

  // Exit opacity
  const exitOpacity = interpolate(frame, [exitFrame, exitFrame + 15], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: '28px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        opacity: exitOpacity,
        fontFamily: fonts.sans,
      }}
    >
      {/* Header row: title + cog button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: colors.text.primary,
            letterSpacing: '-0.01em',
          }}
        >
          Chat Preferences
        </div>
        {/* Cog button */}
        {cogScale > 0.01 && (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: radius.md,
              background: colors.surface.gray50,
              border: `1px solid ${colors.surface.gray200}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${cogScale})`,
              cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z"
                stroke={colors.text.secondary}
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.05 10C12.95 10.22 12.92 10.47 12.96 10.71C13.01 10.95 13.13 11.17 13.3 11.34L13.36 11.4C13.49 11.53 13.60 11.69 13.67 11.86C13.74 12.03 13.77 12.21 13.77 12.4C13.77 12.59 13.74 12.77 13.67 12.94C13.60 13.11 13.49 13.27 13.36 13.4C13.23 13.53 13.07 13.63 12.90 13.70C12.73 13.77 12.55 13.81 12.36 13.81C12.17 13.81 11.99 13.77 11.82 13.70C11.65 13.63 11.50 13.53 11.36 13.40L11.30 13.34C11.13 13.17 10.91 13.05 10.67 13.00C10.43 12.96 10.18 12.99 9.96 13.09C9.74 13.18 9.56 13.34 9.44 13.54C9.31 13.73 9.25 13.96 9.24 14.20V14.40C9.24 14.78 9.09 15.15 8.82 15.42C8.55 15.69 8.18 15.84 7.80 15.84C7.42 15.84 7.05 15.69 6.78 15.42C6.51 15.15 6.36 14.78 6.36 14.40V14.29C6.35 14.04 6.27 13.80 6.13 13.60C5.99 13.40 5.80 13.25 5.57 13.17C5.35 13.07 5.10 13.04 4.86 13.08C4.62 13.13 4.40 13.25 4.23 13.42L4.17 13.48C4.04 13.61 3.88 13.71 3.71 13.78C3.54 13.85 3.36 13.89 3.17 13.89C2.98 13.89 2.80 13.85 2.63 13.78C2.46 13.71 2.30 13.61 2.17 13.48C2.04 13.35 1.94 13.19 1.87 13.02C1.80 12.85 1.76 12.67 1.76 12.48C1.76 12.29 1.80 12.11 1.87 11.94C1.94 11.77 2.04 11.62 2.17 11.48L2.23 11.42C2.40 11.25 2.52 11.03 2.57 10.79C2.61 10.55 2.58 10.30 2.48 10.08C2.39 9.86 2.23 9.68 2.03 9.56C1.84 9.43 1.61 9.37 1.37 9.36H1.17C0.79 9.36 0.42 9.21 0.15 8.94C-0.12 8.67 -0.27 8.30 -0.27 7.92C-0.27 7.54 -0.12 7.17 0.15 6.90C0.42 6.63 0.79 6.48 1.17 6.48H1.28C1.53 6.47 1.77 6.39 1.97 6.25C2.17 6.11 2.32 5.92 2.40 5.69C2.50 5.47 2.53 5.22 2.49 4.98C2.44 4.74 2.32 4.52 2.15 4.35L2.09 4.29C1.96 4.16 1.86 4.00 1.79 3.83C1.72 3.66 1.68 3.48 1.68 3.29C1.68 3.10 1.72 2.92 1.79 2.75C1.86 2.58 1.96 2.42 2.09 2.29C2.22 2.16 2.38 2.06 2.55 1.99C2.72 1.92 2.90 1.88 3.09 1.88C3.28 1.88 3.46 1.92 3.63 1.99C3.80 2.06 3.96 2.16 4.09 2.29L4.15 2.35C4.32 2.52 4.54 2.64 4.78 2.69C5.02 2.73 5.27 2.70 5.49 2.60H5.57C5.79 2.51 5.97 2.35 6.09 2.15C6.22 1.96 6.28 1.73 6.29 1.49V1.29C6.29 0.91 6.44 0.54 6.71 0.27C6.98 0.00 7.35 -0.15 7.73 -0.15C8.11 -0.15 8.48 0.00 8.75 0.27C9.02 0.54 9.17 0.91 9.17 1.29V1.40C9.18 1.64 9.24 1.87 9.37 2.07C9.49 2.27 9.67 2.42 9.89 2.52C10.11 2.62 10.36 2.65 10.60 2.61C10.84 2.56 11.06 2.44 11.23 2.27L11.29 2.21C11.42 2.08 11.58 1.98 11.75 1.91C11.92 1.84 12.10 1.80 12.29 1.80C12.48 1.80 12.66 1.84 12.83 1.91C13.00 1.98 13.16 2.08 13.29 2.21C13.42 2.34 13.52 2.50 13.59 2.67C13.66 2.84 13.70 3.02 13.70 3.21C13.70 3.40 13.66 3.58 13.59 3.75C13.52 3.92 13.42 4.08 13.29 4.21L13.23 4.27C13.06 4.44 12.94 4.66 12.89 4.90C12.85 5.14 12.88 5.39 12.98 5.61V5.69C13.07 5.91 13.23 6.09 13.43 6.21C13.62 6.34 13.85 6.40 14.09 6.41H14.29C14.67 6.41 15.04 6.56 15.31 6.83C15.58 7.10 15.73 7.47 15.73 7.85C15.73 8.23 15.58 8.60 15.31 8.87C15.04 9.14 14.67 9.29 14.29 9.29H14.18C13.94 9.30 13.71 9.36 13.51 9.49C13.31 9.61 13.16 9.79 13.05 10Z"
                stroke={colors.text.secondary}
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Toggle: Enable Source-Grounded Analysis */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Toggle switch — ON state */}
        <div
          style={{
            width: 40,
            height: 22,
            borderRadius: 11,
            background: '#1B2B4B',
            position: 'relative',
            flexShrink: 0,
            marginTop: 1,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 2,
              left: 20,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: '#FFFFFF',
            }}
          />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.text.primary, lineHeight: 1.3 }}>
            Enable Source-Grounded Analysis
          </div>
          <div style={{ fontSize: 11, color: colors.text.secondary, lineHeight: 1.5, marginTop: 3 }}>
            Enable a more precise analysis. The AI will first retrieve specific evidence from your documents to build its answer, which enables verifiable citations and improves accuracy
          </div>
        </div>
      </div>

      {/* Default Prompt Suggestions */}
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: colors.text.primary,
            marginBottom: 10,
          }}
        >
          Default Prompt Suggestions
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {PROMPT_PILLS.map((pill) => (
            <div
              key={pill}
              style={{
                padding: '6px 16px',
                borderRadius: radius.full,
                border: `1px solid ${colors.surface.gray300}`,
                fontSize: 12,
                fontWeight: 500,
                color: colors.text.primary,
                background: colors.surface.white,
                fontFamily: fonts.sans,
              }}
            >
              {pill}
            </div>
          ))}
        </div>
      </div>

      {/* Custom Instructions textarea */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div
          style={{
            flex: 1,
            border: `1px solid ${colors.surface.gray200}`,
            borderRadius: radius.md,
            padding: '12px 14px',
            fontSize: 12.5,
            lineHeight: 1.6,
            color: colors.text.primary,
            fontFamily: fonts.sans,
            position: 'relative',
            minHeight: 80,
          }}
        >
          {totalCharsTyped === 0 && (
            <span style={{ color: colors.text.muted }}>Custom Instructions</span>
          )}
          {totalCharsTyped > 0 && typedText}
          {isTyping && (
            <span
              style={{
                display: 'inline-block',
                width: 1.5,
                height: 14,
                background: colors.brand.primary,
                marginLeft: 1,
                verticalAlign: 'text-bottom',
                opacity: cursorOpacity,
              }}
            />
          )}
        </div>
        <div style={{ fontSize: 11, color: colors.text.secondary, marginTop: 8, lineHeight: 1.5 }}>
          Guide the AI{'\u2019'}s analysis with instructions that are applied to every message. For example: {'\u201C'}Focus only on statements made by Participants.{'\u201D'}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <div
          style={{
            padding: '8px 20px',
            fontSize: 13,
            fontWeight: 500,
            color: colors.text.secondary,
            cursor: 'pointer',
            fontFamily: fonts.sans,
          }}
        >
          Cancel
        </div>
        <div
          style={{
            padding: '8px 24px',
            fontSize: 13,
            fontWeight: 600,
            color: '#FFFFFF',
            background: '#1B2B4B',
            borderRadius: radius.sm,
            cursor: 'pointer',
            fontFamily: fonts.sans,
          }}
        >
          Save
        </div>
      </div>
    </div>
  )
}
