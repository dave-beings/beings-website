import { useCurrentFrame, interpolate } from 'remotion'
import { colors, fonts } from '../../components/marketing/design-tokens'

interface ReportBodyProps {
  introStartFrame: number
  section3StartFrame: number
}

/** Characters typed per frame (slower than CitationDemo for long-form readability) */
const CHARS_PER_FRAME = 3
/** Blinking cursor blink cycle in frames */
const CURSOR_BLINK_FRAMES = 16

// ── Content constants (matching screenshot proportions) ──────

const INTRO_TEXT =
  'The interviews highlight three key themes for improving patient experience:'

const SECTION_1_HEADING = '1. Clarity and Accessibility of Information'
const SECTION_1_BODY =
  'Participants frequently mentioned the importance of clear explanations about the study, its purpose, and what was expected of them. Feedback indicates a need for simpler language, potentially avoiding medical jargon, and providing materials in various formats, including written and face-to-face explanations. Some participants found explanations too fast or paperwork difficult to follow, suggesting that pacing and format diversity are crucial for ensuring comprehensive understanding across diverse participant groups.'

const SECTION_2_HEADING = '2. Respectful and Supportive Staff Interaction'
const SECTION_2_BODY =
  'A recurring sentiment was the desire to feel respected, valued, and listened to by the research team. Participants appreciated staff politeness, approachability, and patience, and felt more comfortable asking questions when they were treated with respect. Conversely, some felt they were \u201Cjust a number\u201D or that cultural considerations were not adequately addressed, leading to feelings of exclusion or difficulty in fully expressing themselves. Enhancing training for staff on cultural sensitivity and communication skills, along with fostering an environment where participants feel genuinely heard and involved, would significantly improve the patient experience.'

const SECTION_3_HEADING = '3. Flexibility and Minimizing Logistical Burdens'

// ── Segment-based typewriter system ──────────────────────────
// ALL segments type out character by character — including headings

const ALL_SEGMENTS = [
  { text: INTRO_TEXT, type: 'intro' as const },
  { text: SECTION_1_HEADING, type: 'sec1heading' as const },
  { text: SECTION_1_BODY, type: 'sec1body' as const },
  { text: SECTION_2_HEADING, type: 'sec2heading' as const },
  { text: SECTION_2_BODY, type: 'sec2body' as const },
  { text: SECTION_3_HEADING, type: 'sec3heading' as const },
]

const TOTAL_CHARS = ALL_SEGMENTS.reduce((sum, s) => sum + s.text.length, 0)

function getTypedSegments(totalCharsTyped: number) {
  let remaining = totalCharsTyped
  const result: Record<string, string> = {}

  for (const seg of ALL_SEGMENTS) {
    const chars = Math.min(remaining, seg.text.length)
    result[seg.type] = seg.text.slice(0, chars)
    remaining -= chars
    if (remaining <= 0) break
  }

  return result
}

const BlinkingCursor: React.FC<{ frame: number; visible: boolean }> = ({ frame, visible }) => {
  if (!visible) return null
  const opacity = interpolate(
    frame % CURSOR_BLINK_FRAMES,
    [0, CURSOR_BLINK_FRAMES / 2, CURSOR_BLINK_FRAMES],
    [1, 0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )
  return (
    <span
      style={{
        opacity,
        color: colors.brand.primary,
        fontWeight: 400,
        marginLeft: 1,
      }}
    >
      {'\u258C'}
    </span>
  )
}

// ── Main ReportBody component ────────────────────────────────

export const ReportBody: React.FC<ReportBodyProps> = ({
  introStartFrame,
  section3StartFrame,
}) => {
  const frame = useCurrentFrame()

  // Global typing starts at introStartFrame
  const typeElapsed = Math.max(0, frame - introStartFrame)
  const totalCharsTyped = Math.min(TOTAL_CHARS, Math.floor(typeElapsed * CHARS_PER_FRAME))
  const isTypingDone = totalCharsTyped >= TOTAL_CHARS
  const showCursor = frame >= introStartFrame && !isTypingDone

  const typed = getTypedSegments(totalCharsTyped)

  // Determine which segment is currently being typed
  const currentSegment = (() => {
    let remaining = totalCharsTyped
    for (const seg of ALL_SEGMENTS) {
      if (remaining < seg.text.length) return seg.type
      remaining -= seg.text.length
    }
    return 'done'
  })()

  const hasIntro = (typed.intro?.length ?? 0) > 0
  const hasSec1Heading = (typed.sec1heading?.length ?? 0) > 0
  const hasSec1Body = (typed.sec1body?.length ?? 0) > 0
  const hasSec2Heading = (typed.sec2heading?.length ?? 0) > 0
  const hasSec2Body = (typed.sec2body?.length ?? 0) > 0
  const hasSec3Heading = (typed.sec3heading?.length ?? 0) > 0

  // Scroll up as content grows — kicks in around section 2 body and increases for section 3
  const scrollY = interpolate(
    frame,
    [section3StartFrame - 60, section3StartFrame, section3StartFrame + 30],
    [0, -30, -70],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  const headingStyle = {
    fontFamily: fonts.sans,
    fontSize: 15,
    fontWeight: 700 as const,
    color: colors.text.primary,
    lineHeight: 1.45,
    marginTop: 16,
    marginBottom: 6,
  }

  const bodyStyle = {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    fontWeight: 400 as const,
    color: colors.text.secondary,
    lineHeight: 1.7,
    margin: 0,
  }

  return (
    <div
      style={{
        flex: 1,
        overflow: 'hidden',
        padding: '18px 24px',
      }}
    >
      <div
        style={{
          transform: `translateY(${scrollY}px)`,
        }}
      >
        {/* Intro paragraph */}
        {hasIntro && (
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 13,
              fontWeight: 400,
              color: colors.text.secondary,
              lineHeight: 1.65,
              margin: '0 0 6px',
            }}
          >
            {typed.intro}
            {showCursor && currentSegment === 'intro' && (
              <BlinkingCursor frame={frame} visible />
            )}
          </p>
        )}

        {/* Section 1 heading — typed out */}
        {hasSec1Heading && (
          <div style={headingStyle}>
            {typed.sec1heading}
            {showCursor && currentSegment === 'sec1heading' && (
              <BlinkingCursor frame={frame} visible />
            )}
          </div>
        )}

        {/* Section 1 body — typed out */}
        {hasSec1Body && (
          <p style={bodyStyle}>
            {typed.sec1body}
            {showCursor && currentSegment === 'sec1body' && (
              <BlinkingCursor frame={frame} visible />
            )}
          </p>
        )}

        {/* Section 2 heading — typed out */}
        {hasSec2Heading && (
          <div style={headingStyle}>
            {typed.sec2heading}
            {showCursor && currentSegment === 'sec2heading' && (
              <BlinkingCursor frame={frame} visible />
            )}
          </div>
        )}

        {/* Section 2 body — typed out */}
        {hasSec2Body && (
          <p style={bodyStyle}>
            {typed.sec2body}
            {showCursor && currentSegment === 'sec2body' && (
              <BlinkingCursor frame={frame} visible />
            )}
          </p>
        )}

        {/* Section 3 heading — typed out, body cut off by viewport */}
        {hasSec3Heading && (
          <div style={headingStyle}>
            {typed.sec3heading}
            {showCursor && currentSegment === 'sec3heading' && (
              <BlinkingCursor frame={frame} visible />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
