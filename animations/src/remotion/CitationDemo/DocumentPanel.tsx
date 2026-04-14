import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { colors, fonts, radius } from '../../components/marketing/design-tokens'

interface DocumentPanelProps {
  scrollStartFrame: number
  scrollEndFrame: number
  highlightInFrame: number
  highlightOutFrame: number
}

const TRANSCRIPT_LINES = [
  '\u201CEverything was explained clearly, and they were',
  'supportive. They were flexible with appointment times,',
  'which helped a lot. I felt valued, not just like a number.',
  'Childcare is always a challenge. I was very satisfied. Yes,',
  'I\u2019d definitely take part again.\u201D Participant 12 Male, 62,',
  'Small business owner, White British \u201CMy GP referred me.',
  'I\u2019ve lived with a long-term condition for years, so I was',
  'interested. The explanation was thorough, maybe a bit',
  'long. Everything was professional. I felt respected.',
  'Parking was expensive and annoying. Overall, I was',
  'satisfied. I\u2019d do it again if there were fewer visits.\u201D',
  'Participant 13 Female, 27, Hospitality worker, Latina 6 \u201CA',
  'friend told me about it.\u201D',
]

// The passage that gets highlighted (about clarity and accessibility)
const HIGHLIGHT_START_LINE = 0
const HIGHLIGHT_END_LINE = 2

const SCROLL_DISTANCE = 0 // starts at top, no scroll needed for this passage

export const DocumentPanel: React.FC<DocumentPanelProps> = ({
  scrollStartFrame,
  scrollEndFrame,
  highlightInFrame,
  highlightOutFrame,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Scroll animation
  const scrollProgress = spring({
    frame: frame - scrollStartFrame,
    fps,
    config: { damping: 200 },
    durationInFrames: scrollEndFrame - scrollStartFrame,
  })
  const scrollY = interpolate(scrollProgress, [0, 1], [0, -SCROLL_DISTANCE])

  // Highlight fade in
  const highlightIn = spring({
    frame: frame - highlightInFrame,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  })

  // Highlight fade out
  const highlightOut = interpolate(
    frame,
    [highlightOutFrame, highlightOutFrame + 25],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  const highlightOpacity = frame >= highlightInFrame
    ? highlightIn * highlightOut
    : 0

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: colors.surface.white,
        overflow: 'hidden',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: `1px solid ${colors.surface.gray200}`,
          background: colors.surface.white,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* PDF icon */}
          <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
            <rect x="0.5" y="0.5" width="15" height="17" rx="2" fill="#F0F4F8" stroke={colors.surface.gray300} />
            <path d="M4 5H12M4 8H12M4 11H9" stroke={colors.text.secondary} strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: 11,
              fontWeight: 500,
              color: colors.text.primary,
              letterSpacing: '-0.01em',
            }}
          >
            Participant Interview Transcripts.pdf
          </span>
        </div>
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: 9,
            fontWeight: 500,
            color: colors.text.secondary,
            background: colors.surface.gray100,
            padding: '2px 8px',
            borderRadius: radius.full,
          }}
        >
          Document
        </span>
      </div>

      {/* Scrollable transcript area */}
      <div
        style={{
          flex: 1,
          padding: '14px 16px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div style={{ transform: `translateY(${scrollY}px)` }}>
          {TRANSCRIPT_LINES.map((line, i) => {
            const isHighlighted = i >= HIGHLIGHT_START_LINE && i <= HIGHLIGHT_END_LINE
            return (
              <div key={i} style={{ position: 'relative' }}>
                {/* Highlight overlay */}
                {isHighlighted && highlightOpacity > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: '-1px -4px',
                      background: `rgba(4, 156, 240, ${0.12 * highlightOpacity})`,
                      borderRadius: 3,
                      boxShadow: highlightOpacity > 0.5
                        ? `0 0 ${8 * highlightOpacity}px rgba(4, 156, 240, ${0.15 * highlightOpacity})`
                        : 'none',
                      // Left accent bar on first highlighted line
                      ...(i === HIGHLIGHT_START_LINE && {
                        borderLeft: `2.5px solid rgba(4, 156, 240, ${0.7 * highlightOpacity})`,
                      }),
                    }}
                  />
                )}
                <p
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 10.5,
                    lineHeight: 1.65,
                    color: colors.text.primary,
                    margin: 0,
                    position: 'relative',
                  }}
                >
                  {line}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
