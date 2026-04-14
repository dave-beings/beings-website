import { useCurrentFrame } from 'remotion'
import { colors, fonts } from '../../components/marketing/design-tokens'
import { TierRow } from './TierRow'
import { ModelList } from './ModelList'

interface SettingsPanelProps {
  /** Frame reveals for each tier row */
  tierLocalReveal: number
  tierUkReveal: number
  tierGlobalReveal: number
  /** UK Sovereign selection + expand */
  ukSelectFrame: number
  ukExpandFrame: number
  /** Global Cloud selection + expand */
  globalSelectFrame: number
  globalExpandFrame: number
  /** Model list scroll timing */
  modelListRevealFrame: number
  modelScrollStartFrame: number
  modelScrollEndFrame: number
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  tierLocalReveal,
  tierUkReveal,
  tierGlobalReveal,
  ukSelectFrame,
  ukExpandFrame,
  globalSelectFrame,
  globalExpandFrame,
  modelListRevealFrame,
  modelScrollStartFrame,
  modelScrollEndFrame,
}) => {
  const frame = useCurrentFrame()

  // Determine selection state based on frame
  const ukSelected = frame >= ukSelectFrame && frame < globalSelectFrame
  const globalSelected = frame >= globalSelectFrame
  const ukExpanded = frame >= ukExpandFrame && frame < globalSelectFrame
  const globalExpanded = frame >= globalExpandFrame

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Settings header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px 12px',
          borderBottom: `1px solid ${colors.surface.gray100}`,
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: colors.text.primary,
            fontFamily: fonts.sans,
          }}
        >
          Settings
        </span>
        {/* X close icon */}
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M5 5L13 13M13 5L5 13"
            stroke={colors.text.muted}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Select Model section */}
      <div style={{ padding: '14px 16px 8px' }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: colors.text.primary,
            fontFamily: fonts.sans,
            marginBottom: 2,
          }}
        >
          Select Model
        </div>
        <div
          style={{
            fontSize: 11,
            color: colors.text.secondary,
            fontFamily: fonts.sans,
            marginBottom: 12,
          }}
        >
          Choose your privacy level first
        </div>
      </div>

      {/* Tier rows */}
      <div style={{ padding: '0 8px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Local — green */}
        <TierRow
          tierColor="#22C55E"
          name="Local"
          description="100% private, on-device"
          badge="Coming Soon"
          badgeVariant="gray"
          revealFrame={tierLocalReveal}
          isSelected={false}
          isExpanded={false}
        />

        {/* UK Sovereign — amber */}
        <TierRow
          tierColor="#F59E0B"
          name="UK Sovereign"
          description="GDPR compliant, PII allowed"
          badge="Active"
          badgeVariant="amber"
          modelCount="1 model"
          revealFrame={tierUkReveal}
          isSelected={ukSelected}
          selectFrame={ukSelectFrame}
          isExpanded={ukExpanded}
          expandFrame={ukExpandFrame}
        >
          {/* Expanded: GPT-4o sub-item */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 0',
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: '2px solid #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#F59E0B',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: colors.text.primary,
                  fontFamily: fonts.sans,
                }}
              >
                GPT-4o
              </span>
              <div
                style={{
                  fontSize: 9.5,
                  color: colors.text.muted,
                  fontFamily: fonts.sans,
                }}
              >
                Privacy gateway for UK data
              </div>
            </div>
            {/* Checkmark */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3.5 8.5L6.5 11.5L12.5 5.5"
                stroke="#22C55E"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </TierRow>

        {/* Global Cloud — red */}
        <TierRow
          tierColor="#EF4444"
          name="Global Cloud"
          description="Best performance, redact PII"
          modelCount="16 models"
          revealFrame={tierGlobalReveal}
          isSelected={globalSelected}
          selectFrame={globalSelectFrame}
          isExpanded={globalExpanded}
          expandFrame={globalExpandFrame}
        >
          {/* Expanded: model list with scroll */}
          <ModelList
            revealFrame={modelListRevealFrame}
            scrollStartFrame={modelScrollStartFrame}
            scrollEndFrame={modelScrollEndFrame}
          />
        </TierRow>
      </div>
    </div>
  )
}
