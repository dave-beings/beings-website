import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { colors, fonts, radius } from '../../components/marketing/design-tokens'
import { EmailChip } from './EmailChip'

interface InviteModalProps {
  /** Frame when this modal fades in */
  fadeInFrame: number
  /** Frame when the first email chip begins typing */
  firstChipFrame: number
  /** Interval in frames between each typed chip */
  chipTypingInterval: number
  /** Frame when the stagger chips begin appearing */
  staggerStartFrame: number
  /** Interval in frames between stagger chips */
  staggerInterval: number
  /** Frame when cursor clicks "Send Invitations" */
  sendClickFrame: number
}

const TYPED_EMAILS = ['craig@murdoch.edu.au', 'braydesh@az.org']
const STAGGER_EMAILS = [
  'tehal@az.org',
  'mimi@research.io',
  'dana@kcl.ac.uk',
  'amy.mathews@nhs.net',
]

/** Frame delay after send click before success overlay appears */
const SUCCESS_DELAY = 8

export const InviteModal: React.FC<InviteModalProps> = ({
  fadeInFrame,
  firstChipFrame,
  chipTypingInterval,
  staggerStartFrame,
  staggerInterval,
  sendClickFrame,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Fade in
  const fadeIn = interpolate(frame, [fadeInFrame, fadeInFrame + 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Send button press animation
  const sendPress = frame >= sendClickFrame
    ? spring({
        frame: frame - sendClickFrame,
        fps,
        config: { damping: 20, stiffness: 200 },
      })
    : 0
  const sendScale = frame >= sendClickFrame
    ? interpolate(sendPress, [0, 0.5, 1], [1, 0.95, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1

  // Success state
  const successFrame = sendClickFrame + SUCCESS_DELAY
  const showSuccess = frame >= successFrame

  // Form content fades down when success appears
  const formOpacity = showSuccess
    ? interpolate(frame, [successFrame, successFrame + 10], [1, 0.15], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1

  // Success overlay spring
  const successSpring = showSuccess
    ? spring({
        frame: frame - successFrame,
        fps,
        config: { damping: 25, stiffness: 160 },
      })
    : 0
  const successScale = interpolate(successSpring, [0, 1], [0.7, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const successOpacity = interpolate(successSpring, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Checkmark draw animation
  const checkDraw = showSuccess
    ? interpolate(frame, [successFrame + 6, successFrame + 16], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0

  // Count how many chips are visible (for helper text logic)
  const allEmails = [...TYPED_EMAILS, ...STAGGER_EMAILS]
  const totalChips = allEmails.length
  const lastStaggerFrame = staggerStartFrame + (STAGGER_EMAILS.length - 1) * staggerInterval
  const allChipsVisible = frame >= lastStaggerFrame + 10

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '40px 48px',
        opacity: fadeIn,
        position: 'absolute',
        inset: 0,
      }}
    >
      {/* Form content — fades when success shows */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, opacity: formOpacity }}>
        {/* Header icon */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: radius.md,
            background: `linear-gradient(135deg, ${colors.brand.primary}, ${colors.brand.primaryLight})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M13 10H17M15 8V12"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M8 2C5.79 2 4 3.79 4 6C4 8.21 5.79 10 8 10C10.21 10 12 8.21 12 6C12 3.79 10.21 2 8 2Z"
              fill="white"
              opacity="0.9"
            />
            <path
              d="M2 17C2 14.24 4.69 12 8 12C9.5 12 10.87 12.47 11.95 13.26"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.9"
            />
          </svg>
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: fonts.sans,
            fontSize: 22,
            fontWeight: 600,
            color: colors.text.primary,
            margin: '0 0 4px',
            lineHeight: 1.3,
          }}
        >
          Invite Members
        </h2>
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 14,
            color: colors.text.secondary,
            margin: '0 0 20px',
            lineHeight: 1.5,
          }}
        >
          Add team members to collaborate on this project
        </p>

        {/* Email addresses label */}
        <label
          style={{
            fontFamily: fonts.sans,
            fontSize: 13,
            fontWeight: 600,
            color: colors.text.primary,
            marginBottom: 6,
            display: 'block',
          }}
        >
          Email addresses
        </label>

        {/* Email chips container */}
        <div
          style={{
            border: `1.5px solid ${colors.surface.gray200}`,
            borderRadius: radius.sm,
            padding: '8px 10px',
            minHeight: 72,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            alignContent: 'flex-start',
            background: colors.surface.white,
            marginBottom: 4,
          }}
        >
          {/* Typed chips (first 2) */}
          {TYPED_EMAILS.map((email, i) => (
            <EmailChip
              key={email}
              email={email}
              startFrame={firstChipFrame + i * chipTypingInterval}
              typeEffect={true}
              charsPerFrame={1}
            />
          ))}

          {/* Stagger chips (remaining 4) */}
          {STAGGER_EMAILS.map((email, i) => (
            <EmailChip
              key={email}
              email={email}
              startFrame={staggerStartFrame + i * staggerInterval}
              typeEffect={false}
            />
          ))}
        </div>

        {/* Helper text */}
        {!allChipsVisible && (
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 12,
              color: colors.text.muted,
              margin: '2px 0 0',
            }}
          >
            Press Enter or Tab to add email
          </p>
        )}

        {/* Member count badge */}
        {allChipsVisible && (
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 12,
              fontWeight: 500,
              color: colors.brand.primary,
              margin: '2px 0 0',
            }}
          >
            {totalChips} members ready to invite
          </p>
        )}

        {/* Role selector */}
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <label
            style={{
              fontFamily: fonts.sans,
              fontSize: 13,
              fontWeight: 600,
              color: colors.text.primary,
            }}
          >
            Role
          </label>
          <div
            style={{
              border: `1px solid ${colors.surface.gray200}`,
              borderRadius: radius.sm,
              padding: '5px 10px',
              fontFamily: fonts.sans,
              fontSize: 13,
              color: colors.text.primary,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Member
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M2.5 4L5 6.5L7.5 4"
                stroke={colors.text.muted}
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Buttons row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
          }}
        >
          <button
            style={{
              fontFamily: fonts.sans,
              fontSize: 14,
              fontWeight: 500,
              color: colors.text.secondary,
              background: 'transparent',
              border: `1px solid ${colors.surface.gray200}`,
              borderRadius: radius.sm,
              padding: '8px 18px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            style={{
              fontFamily: fonts.sans,
              fontSize: 14,
              fontWeight: 600,
              color: colors.surface.white,
              background: colors.brand.primary,
              border: 'none',
              borderRadius: radius.sm,
              padding: '8px 22px',
              cursor: 'pointer',
              transform: `scale(${sendScale})`,
            }}
          >
            Send Invitations
          </button>
        </div>
      </div>

      {/* ── Success overlay ── */}
      {showSuccess && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            opacity: successOpacity,
            transform: `scale(${successScale})`,
          }}
        >
          {/* Green checkmark circle */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#22C55E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M7 14.5L12 19.5L21 9.5"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="30"
                strokeDashoffset={interpolate(checkDraw, [0, 1], [30, 0], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                })}
              />
            </svg>
          </div>

          {/* Success text */}
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 20,
                fontWeight: 600,
                color: colors.text.primary,
                margin: '0 0 4px',
              }}
            >
              Invitations Sent!
            </p>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 14,
                color: colors.text.secondary,
                margin: 0,
              }}
            >
              {totalChips} team members will receive an invite
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
