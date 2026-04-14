import { useRef, useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { useAnimationLoop, lerp } from './shared/useAnimationLoop'
import { AnimatedCursor } from './shared/AnimatedCursor'
import { TypingText } from './shared/TypingText'

/**
 * Timing in seconds (13s loop). Canvas 800×500.
 */
const T = {
  duration: 13.0,

  entranceEnd: 0.67,

  /** Phase 1 — Create Organisation */
  orgTypeStart: 1.83,
  orgTypeEnd: 2.5,

  createBtnPress: 3.33,

  /** Phase 2 — Crossfade */
  orgFadeStart: 4.03,
  orgFadeDuration: 0.5,
  inviteFadeStart: 4.33,
  inviteFadeDuration: 0.5,

  /** Phase 3 — Invite */
  email1TypeStart: 5.17,
  email1TypeEnd: 5.94,
  email2TypeStart: 6.57, // 5.17 + 42/30
  email2TypeEnd: 7.22,

  chipPop1: 8.33,
  chipPop2: 8.83,
  chipPop3: 9.33,
  chipPop4: 9.83,

  sendBtnPress: 10.83,

  /** Phase 4 */
  successGlowStart: 11.0,
  successGlowEnd: 11.67,

  loopFadeStart: 12.33,
  loopFadeEnd: 12.97,

  // Cursor segments (targets match spec)
  c1Enter: 1.0,
  c1Click: 1.67,
  c1Exit: 2.55,
  c2Enter: 2.83,
  c2Click: 3.33,
  c2Exit: 3.95,
  c3Enter: 4.45,
  c3Click: 4.83,
  c3Exit: 5.35,
  c4Enter: 10.0,
  c4Click: 10.83,
  c4Exit: 11.45,

  c1x: 340,
  c1y: 230,
  c2x: 590,
  c2y: 390,
  c3x: 300,
  c3y: 230,
  c4x: 580,
  c4y: 390,
} as const

const ORG_NAME = 'Brightbank Research Group'
const EMAIL1 = 'j.martinez@brightbank.co.uk'
const EMAIL2 = 's.chen@brightbank.co.uk'
const EXTRA_CHIPS = [
  'r.patel@bb.co.uk',
  'a.johnson@bb.co.uk',
  'm.davis@bb.co.uk',
  'l.wilson@bb.co.uk',
] as const

const W = 800
const H = 500

/** Modal content padding from card inner edge */
const PAD = 28

/** Org name typing — relative to org layer (padding box), matches cursor target */
const ORG_TEXT = { x: 10, y: 152, w: 360 }
const CHIP_TEXT_W = 200

function chipPopStyle(time: number, popAt: number) {
  const o = lerp(time, popAt, popAt + 0.18, 0, 1)
  const s = lerp(time, popAt, popAt + 0.18, 0.92, 1)
  return { opacity: o, transform: `scale(${s})` as const }
}

function EmailChipShell({
  children,
  time,
  popAt,
  style,
}: {
  children: ReactNode
  time: number
  popAt: number
  style?: CSSProperties
}) {
  const st = chipPopStyle(time, popAt)
  if (st.opacity <= 0) return null
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px 3px 10px',
        borderRadius: 9999,
        background: 'color-mix(in srgb, var(--color-primary) 14%, var(--color-divider))',
        border: '1px solid var(--color-divider)',
        fontFamily: 'var(--font-family)',
        fontSize: 7,
        lineHeight: 1.4,
        color: 'var(--color-text-primary)',
        verticalAlign: 'middle',
        ...st,
        ...style,
      }}
    >
      {children}
      <span
        style={{
          fontSize: 9,
          lineHeight: 1,
          color: 'var(--color-text-secondary)',
          cursor: 'default',
          padding: '0 1px',
        }}
        aria-hidden
      >
        ×
      </span>
    </div>
  )
}

export default function TeamDemo() {
  const { time, containerRef, reducedMotion } = useAnimationLoop({
    duration: T.duration,
  })
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
  const entranceScale = lerp(time, 0, T.entranceEnd, 0.96, 1)
  const loopFade = lerp(time, T.loopFadeStart, T.loopFadeEnd, 1, 0)
  const containerOpacity = Math.min(entranceFade, loopFade)

  const orgFadeOut = lerp(time, T.orgFadeStart, T.orgFadeStart + T.orgFadeDuration, 1, 0)
  const inviteFadeIn = lerp(time, T.inviteFadeStart, T.inviteFadeStart + T.inviteFadeDuration, 0, 1)
  const orgLayerOpacity = time < T.orgFadeStart ? 1 : orgFadeOut
  const inviteLayerOpacity = inviteFadeIn

  const successPulse =
    time >= T.successGlowStart && time < T.successGlowEnd
      ? lerp(time, T.successGlowStart, T.successGlowEnd, 0.35, 0)
      : 0

  const createBtnActive = time >= T.createBtnPress && time < T.createBtnPress + 0.22
  const sendBtnActive = time >= T.sendBtnPress && time < T.sendBtnPress + 0.22

  if (reducedMotion) {
    return (
      <div
        ref={wrapperRef}
        role="img"
        aria-label="Team creation and invite flow"
        style={{
          width: '100%',
          aspectRatio: `${W}/${H}`,
          overflow: 'hidden',
          borderRadius: 12,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'var(--color-background)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            style={{
              width: 'min(100%, 560px)',
              aspectRatio: '560/420',
              borderRadius: 12,
              background: 'var(--color-surface)',
              boxShadow: 'var(--elevation-3)',
              border: '1px solid var(--color-divider)',
              padding: PAD,
              fontFamily: 'var(--font-family)',
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 600, margin: 0, color: 'var(--color-text-primary)' }}>
              Invite team members
            </p>
            <p style={{ fontSize: 10, margin: '6px 0 0', color: 'var(--color-text-secondary)' }}>
              Add colleagues to {ORG_NAME}
            </p>
          </div>
        </div>
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
      aria-label="Animated team organisation and invite demonstration"
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
          background: 'var(--color-background)',
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
          {/* Modal shell */}
          <div
            style={{
              position: 'absolute',
              left: 120,
              top: 40,
              right: 120,
              bottom: 40,
              borderRadius: 12,
              background: 'var(--color-surface)',
              boxShadow:
                successPulse > 0
                  ? `var(--elevation-4), 0 0 32px rgba(91, 111, 204, ${successPulse})`
                  : 'var(--elevation-4)',
              border: '1px solid var(--color-divider)',
              overflow: 'hidden',
            }}
          >
            {/* Org modal */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                padding: PAD,
                opacity: orgLayerOpacity,
                pointerEvents: 'none',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                Create an Organisation
              </h2>
              <p
                style={{
                  margin: '6px 0 0',
                  fontSize: 8,
                  fontWeight: 500,
                  color: 'var(--color-text-secondary)',
                }}
              >
                Set up your team workspace
              </p>
              <label
                style={{
                  display: 'block',
                  marginTop: 106,
                  fontSize: 7,
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  letterSpacing: '0.02em',
                }}
              >
                Organisation name
              </label>
              <div
                style={{
                  marginTop: 6,
                  width: 384,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid var(--color-divider)',
                  background: 'var(--color-background)',
                  boxShadow: 'var(--elevation-1)',
                }}
              />
              <TypingText
                time={time}
                text={ORG_NAME}
                startTime={T.orgTypeStart}
                endTime={T.orgTypeEnd}
                fadeOutTime={T.orgFadeStart}
                x={ORG_TEXT.x}
                y={ORG_TEXT.y}
                width={ORG_TEXT.w}
              />
              <div
                style={{
                  position: 'absolute',
                  right: PAD,
                  bottom: PAD,
                }}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  style={{
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 18px',
                    fontFamily: 'var(--font-family)',
                    fontSize: 8,
                    fontWeight: 600,
                    color: '#fff',
                    background: createBtnActive
                      ? 'color-mix(in srgb, var(--color-primary) 88%, black)'
                      : 'var(--color-primary)',
                    boxShadow: 'var(--elevation-1)',
                    cursor: 'default',
                  }}
                >
                  Create Organisation
                </button>
              </div>
            </div>

            {/* Invite modal */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                padding: PAD,
                opacity: inviteLayerOpacity,
                pointerEvents: 'none',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                Invite team members
              </h2>
              <p
                style={{
                  margin: '6px 0 0',
                  fontSize: 8,
                  fontWeight: 500,
                  color: 'var(--color-text-secondary)',
                }}
              >
                Add colleagues to {ORG_NAME}
              </p>
              <label
                style={{
                  display: 'block',
                  marginTop: 106,
                  fontSize: 7,
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  letterSpacing: '0.02em',
                }}
              >
                Email addresses
              </label>
              <div
                style={{
                  marginTop: 6,
                  width: 304,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid var(--color-divider)',
                  background: 'var(--color-background)',
                  boxShadow: 'var(--elevation-1)',
                }}
              />
              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  alignItems: 'center',
                  maxWidth: 520,
                }}
              >
                {time >= T.email1TypeStart && (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '3px 8px 3px 10px',
                        borderRadius: 9999,
                        background: 'color-mix(in srgb, var(--color-primary) 14%, var(--color-divider))',
                        border: '1px solid var(--color-divider)',
                        minHeight: 22,
                      }}
                    >
                      <TypingText
                        time={time}
                        text={EMAIL1}
                        startTime={T.email1TypeStart}
                        endTime={T.email1TypeEnd}
                        fadeOutTime={T.loopFadeStart}
                        x={0}
                        y={0}
                        width={CHIP_TEXT_W}
                      />
                      <span style={{ fontSize: 9, color: 'var(--color-text-secondary)' }} aria-hidden>
                        ×
                      </span>
                    </div>
                  </div>
                )}
                {time >= T.email2TypeStart && (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '3px 8px 3px 10px',
                        borderRadius: 9999,
                        background: 'color-mix(in srgb, var(--color-primary) 14%, var(--color-divider))',
                        border: '1px solid var(--color-divider)',
                        minHeight: 22,
                      }}
                    >
                      <TypingText
                        time={time}
                        text={EMAIL2}
                        startTime={T.email2TypeStart}
                        endTime={T.email2TypeEnd}
                        fadeOutTime={T.loopFadeStart}
                        x={0}
                        y={0}
                        width={CHIP_TEXT_W}
                      />
                      <span style={{ fontSize: 9, color: 'var(--color-text-secondary)' }} aria-hidden>
                        ×
                      </span>
                    </div>
                  </div>
                )}
                <EmailChipShell time={time} popAt={T.chipPop1}>
                  {EXTRA_CHIPS[0]}
                </EmailChipShell>
                <EmailChipShell time={time} popAt={T.chipPop2}>
                  {EXTRA_CHIPS[1]}
                </EmailChipShell>
                <EmailChipShell time={time} popAt={T.chipPop3}>
                  {EXTRA_CHIPS[2]}
                </EmailChipShell>
                <EmailChipShell time={time} popAt={T.chipPop4}>
                  {EXTRA_CHIPS[3]}
                </EmailChipShell>
              </div>
              <div
                style={{
                  position: 'absolute',
                  right: PAD,
                  bottom: PAD,
                }}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  style={{
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 18px',
                    fontFamily: 'var(--font-family)',
                    fontSize: 8,
                    fontWeight: 600,
                    color: '#fff',
                    background: sendBtnActive
                      ? 'color-mix(in srgb, var(--color-primary) 88%, black)'
                      : 'var(--color-primary)',
                    boxShadow: 'var(--elevation-1)',
                    cursor: 'default',
                  }}
                >
                  Send Invites
                </button>
              </div>
            </div>
          </div>

          <AnimatedCursor
            time={time}
            enterTime={T.c1Enter}
            clickTime={T.c1Click}
            exitTime={T.c1Exit}
            targetX={T.c1x}
            targetY={T.c1y}
          />
          <AnimatedCursor
            time={time}
            enterTime={T.c2Enter}
            clickTime={T.c2Click}
            exitTime={T.c2Exit}
            targetX={T.c2x}
            targetY={T.c2y}
          />
          <AnimatedCursor
            time={time}
            enterTime={T.c3Enter}
            clickTime={T.c3Click}
            exitTime={T.c3Exit}
            targetX={T.c3x}
            targetY={T.c3y}
          />
          <AnimatedCursor
            time={time}
            enterTime={T.c4Enter}
            clickTime={T.c4Click}
            exitTime={T.c4Exit}
            targetX={T.c4x}
            targetY={T.c4y}
          />

          <div
            style={{
              position: 'absolute',
              bottom: 18,
              right: 22,
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
