import { useRef, useEffect, useState, type ReactNode } from 'react'
import { useAnimationLoop, lerp } from './shared/useAnimationLoop'
import { AnimatedCursor } from './shared/AnimatedCursor'

/**
 * Timing (seconds). Canvas 600×550, duration 14s.
 */
const T = {
  duration: 14,
  entranceEnd: 0.67,
  tierStagger: [1.5, 1.9, 2.3] as const,
  tierInDuration: 0.35,
  cursor1Enter: 3.0,
  cursor1Click: 3.83,
  cursor1Exit: 5.0,
  cursor2Enter: 5.0,
  cursor2Click: 5.67,
  cursor2Exit: 13.33,
  warningAppear: 5.83,
  bulletStart: 6.17,
  bulletGap: 0.2,
  warningFadeStart: 10.0,
  warningFadeEnd: 10.5,
  modelReveal: 10.33,
  modelScrollStart: 11.0,
  modelScrollEnd: 12.67,
  loopFadeStart: 13.33,
  loopFadeEnd: 13.97,
  cursor1X: 330,
  cursor1Y: 250,
  cursor2X: 330,
  cursor2Y: 340,
} as const

const W = 600
const H = 550

/** Card insets from canvas edge */
const CARD = { left: 40, right: 40, top: 20, bottom: 20 }

const MODELS = ['gpt-4o', 'gpt-4o-mini', 'claude-3.5-sonnet', 'gemini-1.5-pro', 'llama-3.1-70b'] as const

const WARNING_BULLETS = [
  'Data may be processed outside the UK',
  'Subject to international data transfer regulations',
  'Not recommended for sensitive research data',
] as const

function tierRowOpacity(time: number, stagger: number): number {
  return lerp(time, stagger, stagger + T.tierInDuration, 0, 1)
}

function tierRowY(time: number, stagger: number): number {
  return lerp(time, stagger, stagger + T.tierInDuration, 6, 0)
}

function Radio({ selected }: { selected: boolean }) {
  return (
    <div
      style={{
        width: 14,
        height: 14,
        borderRadius: '50%',
        border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-divider)'}`,
        background: selected ? 'var(--color-primary)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {selected && (
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: '#FFFFFF',
          }}
        />
      )}
    </div>
  )
}

function IconLaptop() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8H4V6zM2 16h20v1a1 1 0 01-1 1H3a1 1 0 01-1-1v-1z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconShield() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l7 3v6c0 4.5-3 8.5-7 9-4-0.5-7-4.5-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconGlobe() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function IconWarning() {
  return (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2L2 20h20L12 2z"
        fill="var(--color-warning, #E8A317)"
        stroke="var(--color-warning, #C48A0A)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M12 9v4M12 17h.01" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

type TierId = 'local' | 'uk' | 'global'

interface TierRowProps {
  time: number
  stagger: number
  accent: string
  icon: ReactNode
  title: string
  description: string
  selected: boolean
  expanded?: boolean
  detailLines?: readonly string[]
}

function TierRow({
  time,
  stagger,
  accent,
  icon,
  title,
  description,
  selected,
  expanded,
  detailLines,
}: TierRowProps) {
  const op = tierRowOpacity(time, stagger)
  const dy = tierRowY(time, stagger)
  return (
    <div
      style={{
        opacity: op,
        transform: `translateY(${dy}px)`,
        borderRadius: 10,
        border: '1px solid var(--color-divider)',
        background: selected ? 'color-mix(in srgb, var(--color-primary) 8%, var(--color-surface))' : 'var(--color-surface)',
        overflow: 'hidden',
        marginBottom: 10,
        boxShadow: selected ? 'var(--elevation-1)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'stretch', minHeight: 56, position: 'relative' }}>
        <div style={{ width: 4, background: accent, flexShrink: 0 }} />
        <div
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            paddingRight: 56,
            minHeight: 56,
          }}
        >
          <div style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }}>{icon}</div>
          <div style={{ flex: 1, minWidth: 0, maxWidth: '52%' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>{title}</div>
            <div style={{ fontSize: 9, lineHeight: 1.35, color: 'var(--color-text-secondary)' }}>{description}</div>
          </div>
          <div
            style={{
              position: 'absolute',
              left: '56%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Radio selected={selected} />
          </div>
        </div>
      </div>
      {expanded && detailLines && (
        <div
          style={{
            padding: '0 12px 10px 22px',
            borderTop: '1px solid var(--color-divider)',
            fontSize: 8.5,
            lineHeight: 1.45,
            color: 'var(--color-text-secondary)',
          }}
        >
          {detailLines.map((line) => (
            <div key={line}>• {line}</div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SecurityDemo() {
  const { time, containerRef, reducedMotion } = useAnimationLoop({ duration: T.duration })
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!wrapperRef.current) return
    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / W)
    })
    observer.observe(wrapperRef.current)
    return () => observer.disconnect()
  }, [])

  const entranceFade = lerp(time, 0, T.entranceEnd, 0, 1)
  const entranceScale = lerp(time, 0, T.entranceEnd, 0.95, 1)
  const loopFade = lerp(time, T.loopFadeStart, T.loopFadeEnd, 1, 0)
  const containerOpacity = Math.min(entranceFade, loopFade)

  const ukExpanded = time >= T.cursor1Click

  let selected: TierId = 'local'
  if (time >= T.cursor2Click) selected = 'global'
  else if (time >= T.cursor1Click) selected = 'uk'

  const warningOpacityRaw =
    time < T.warningAppear
      ? 0
      : time < T.warningFadeStart
        ? lerp(time, T.warningAppear, T.warningAppear + 0.25, 0, 1)
        : lerp(time, T.warningFadeStart, T.warningFadeEnd, 1, 0)
  const warningOpacity = Math.max(0, Math.min(1, warningOpacityRaw))

  const modelListOpacity = lerp(time, T.modelReveal, T.modelReveal + 0.35, 0, 1)
  const scrollY = lerp(time, T.modelScrollStart, T.modelScrollEnd, 0, -40)

  const cardWidth = W - CARD.left - CARD.right
  const cardHeight = H - CARD.top - CARD.bottom

  if (reducedMotion) {
    return (
      <div
        ref={wrapperRef}
        role="img"
        aria-label="Security and model settings demonstration"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: `${W}/${H}`,
          overflow: 'hidden',
          borderRadius: 12,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: CARD.left,
            top: CARD.top,
            width: cardWidth,
            height: cardHeight,
            borderRadius: 12,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-divider)',
            boxShadow: 'var(--elevation-3)',
          }}
        />
      </div>
    )
  }

  return (
    <div
      ref={(node) => {
        ;(wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = node
        ;(containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
      }}
      role="img"
      aria-label="Animated security and model settings demonstration"
      style={{
        width: '100%',
        aspectRatio: `${W}/${H}`,
        overflow: 'hidden',
        borderRadius: 12,
      }}
    >
      <div
        style={{
          width: W,
          height: H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'relative',
          fontFamily: 'var(--font-family)',
          opacity: containerOpacity,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `scale(${entranceScale})`,
            transformOrigin: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: CARD.left,
              top: CARD.top,
              width: cardWidth,
              height: cardHeight,
              borderRadius: 12,
              background: 'var(--color-background)',
              boxShadow: 'var(--elevation-3)',
              border: '1px solid var(--color-divider)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 12,
                  letterSpacing: '-0.02em',
                }}
              >
                Security & Model Settings
              </div>

              {/* Spacing tuned so UK / Global radio centers sit near y≈250 / y≈340 on the 600×550 canvas */}
              <div style={{ flex: 1, overflow: 'hidden', paddingTop: 50 }}>
                <TierRow
                  time={time}
                  stagger={T.tierStagger[0]}
                  accent="#2E7D32"
                  icon={<IconLaptop />}
                  title="Local Processing"
                  description="On-device inference, maximum privacy"
                  selected={selected === 'local'}
                />
                <TierRow
                  time={time}
                  stagger={T.tierStagger[1]}
                  accent="#1565C0"
                  icon={<IconShield />}
                  title="UK Sovereign"
                  description="UK data centres, GDPR compliant"
                  selected={selected === 'uk'}
                  expanded={ukExpanded}
                  detailLines={['Data residency: UK only', 'Encryption: AES-256', 'Compliance: ISO 27001, SOC 2']}
                />
                <TierRow
                  time={time}
                  stagger={T.tierStagger[2]}
                  accent="#6A1B9A"
                  icon={<IconGlobe />}
                  title="Global Cloud"
                  description="Best performance, worldwide routing"
                  selected={selected === 'global'}
                />
              </div>

              {/* Model list */}
              <div
                style={{
                  marginTop: 8,
                  height: 36,
                  borderRadius: 8,
                  border: '1px solid var(--color-divider)',
                  background: 'var(--color-surface)',
                  overflow: 'hidden',
                  opacity: modelListOpacity,
                }}
              >
                <div
                  style={{
                    padding: '8px 12px',
                    transform: `translateY(${scrollY}px)`,
                    fontSize: 9,
                    lineHeight: 1.6,
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'ui-monospace, monospace',
                  }}
                >
                  {MODELS.map((m) => (
                    <div key={m}>{m}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Warning overlay — centered in card */}
            {warningOpacity > 0.01 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'color-mix(in srgb, var(--color-background) 45%, transparent)',
                  opacity: warningOpacity,
                  pointerEvents: 'none',
                  zIndex: 20,
                }}
              >
                <div
                  style={{
                    width: '78%',
                    maxWidth: 360,
                    borderRadius: 12,
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-divider)',
                    boxShadow: 'var(--elevation-4)',
                    padding: '16px 18px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <IconWarning />
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', paddingTop: 4 }}>
                      Global Cloud Warning
                    </div>
                  </div>
                  <ul style={{ margin: '0 0 14px 0', paddingLeft: 18, fontSize: 9, lineHeight: 1.45, color: 'var(--color-text-secondary)' }}>
                    {WARNING_BULLETS.map((text, i) => {
                      const t0 = T.bulletStart + i * T.bulletGap
                      const bulletOp = lerp(time, t0, t0 + 0.2, 0, 1)
                      return (
                        <li key={text} style={{ opacity: bulletOp, marginBottom: 4 }}>
                          {text}
                        </li>
                      )
                    })}
                  </ul>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '6px 14px',
                      borderRadius: 8,
                      background: 'var(--color-primary)',
                      color: '#FFFFFF',
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    I understand
                  </div>
                </div>
              </div>
            )}
          </div>

          <AnimatedCursor
            time={time}
            enterTime={T.cursor1Enter}
            clickTime={T.cursor1Click}
            exitTime={T.cursor1Exit}
            targetX={T.cursor1X}
            targetY={T.cursor1Y}
          />
          <AnimatedCursor
            time={time}
            enterTime={T.cursor2Enter}
            clickTime={T.cursor2Click}
            exitTime={T.cursor2Exit}
            targetX={T.cursor2X}
            targetY={T.cursor2Y}
          />

          <div
            style={{
              position: 'absolute',
              bottom: 16,
              right: 20,
              fontFamily: 'var(--font-family)',
              fontSize: 8,
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.04em',
              opacity: 0.5,
            }}
          >
            beings.com
          </div>
        </div>
      </div>
    </div>
  )
}
