import { useRef, useEffect, useState } from 'react'
import { useAnimationLoop, lerp } from './shared/useAnimationLoop'

const T = {
  duration: 14.0,
  entranceFadeEnd: 0.67,
  headerStart: 0.67,
  headerEnd: 1.5,
  userMsgStart: 1.67,
  userMsgEnd: 2.67,
  typeStart: 2.83,
  actionBarStart: 10.67,
  loopFadeStart: 13.17,
  loopFadeEnd: 13.97,
} as const

const USER_QUESTION =
  'Can you explain any differences in response that came up from employed vs unemployed or self-employed participants'

const INTRO = 'The interviews reveal distinct challenges and feedback patterns based on participants\u2019 employment status, primarily revolving around logistical flexibility and the communication of information.'
const HEADING = 'Employed, Self-Employed, and Full-time Carers'
const BODY_PRE = 'This group consistently highlighted issues related to time commitment and scheduling flexibility. Participants in full-time employment, self-employment, or those with significant caring responsibilities frequently found it \u201Ctricky\u201D or \u201Cnot easy\u201D to fit appointments around work or other commitments. For example, a taxi driver noted the difficulty in \u201Cfitting it around work\u201D, a part-time retail worker found \u201Ctaking time off work wasn\u2019t easy\u201D, and a full-time carer struggled with \u201Cjuggling my caring responsibilities\u201D'
const BODY_POST = '. Suggestions for improvement from these individuals included greater flexibility in appointment times, such as offering evening slots, reducing the number of visits, and providing remote participation options.'

const SEGMENTS = [
  { text: INTRO, type: 'intro' },
  { text: HEADING, type: 'heading' },
  { text: BODY_PRE, type: 'bodyPre' },
  { text: BODY_POST, type: 'bodyPost' },
] as const

const TOTAL_CHARS = SEGMENTS.reduce((s, seg) => s + seg.text.length, 0)
const CHARS_PER_SEC = 120
const BLINK_PERIOD = 0.53
const BUTTONS = ['Summarise', 'Discuss', 'Evaluate']

const W = 800
const H = 500

function getTypedSegments(totalChars: number) {
  let remaining = totalChars
  const result: Record<string, string> = {}
  for (const seg of SEGMENTS) {
    const chars = Math.min(remaining, seg.text.length)
    result[seg.type] = seg.text.slice(0, chars)
    remaining -= chars
    if (remaining <= 0) break
  }
  return result
}

function getCurrentSegment(totalChars: number) {
  let remaining = totalChars
  for (const seg of SEGMENTS) {
    if (remaining < seg.text.length) return seg.type
    remaining -= seg.text.length
  }
  return 'done'
}

export default function PromptResponseDemo() {
  const { time, containerRef, reducedMotion } = useAnimationLoop({ duration: T.duration })
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!wrapperRef.current) return
    const obs = new ResizeObserver(([e]) => setScale(e.contentRect.width / W))
    obs.observe(wrapperRef.current)
    return () => obs.disconnect()
  }, [])

  const entranceFade = lerp(time, 0, T.entranceFadeEnd, 0, 1)
  const loopFade = lerp(time, T.loopFadeStart, T.loopFadeEnd, 1, 0)
  const opacity = Math.min(entranceFade, loopFade)

  const headerProgress = Math.max(0, Math.min(1, (time - T.headerStart) / (T.headerEnd - T.headerStart)))
  const headerEased = 1 - Math.pow(1 - headerProgress, 3)

  const userMsgProgress = Math.max(0, Math.min(1, (time - T.userMsgStart) / (T.userMsgEnd - T.userMsgStart)))
  const userMsgEased = 1 - Math.pow(1 - userMsgProgress, 3)
  const userMsgX = 30 * (1 - userMsgEased)

  const typeElapsed = Math.max(0, time - T.typeStart)
  const totalCharsTyped = Math.min(TOTAL_CHARS, Math.floor(typeElapsed * CHARS_PER_SEC))
  const isTypingDone = totalCharsTyped >= TOTAL_CHARS
  const showCursor = time >= T.typeStart && !isTypingDone
  const typed = getTypedSegments(totalCharsTyped)
  const currentSeg = getCurrentSegment(totalCharsTyped)
  const avatarOpacity = lerp(time, T.typeStart - 0.33, T.typeStart, 0, 1)
  const blinkPhase = (time % BLINK_PERIOD) / BLINK_PERIOD
  const caretVisible = showCursor && blinkPhase < 0.5

  const bodyPreDone = (typed.bodyPre?.length ?? 0) === BODY_PRE.length
  const citationScale = bodyPreDone ? Math.min(1, (typeElapsed - (INTRO.length + HEADING.length + BODY_PRE.length) / CHARS_PER_SEC) * 5) : 0

  const actionBarProgress = Math.max(0, Math.min(1, (time - T.actionBarStart) / 0.67))
  const actionBarEased = 1 - Math.pow(1 - actionBarProgress, 3)
  const actionBarY = 20 * (1 - actionBarEased)

  const Caret = () => caretVisible ? <span style={{ color: 'var(--color-primary)', fontWeight: 400, marginLeft: 1 }}>{'\u258C'}</span> : null

  if (reducedMotion) {
    return <div ref={wrapperRef} role="img" aria-label="Chat prompt and response" style={{ width: '100%', aspectRatio: `${W}/${H}`, borderRadius: 12, background: 'var(--color-surface)', border: '1px solid var(--color-divider)' }} />
  }

  return (
    <div ref={(n) => { (wrapperRef as any).current = n; (containerRef as any).current = n }} role="img" aria-label="Animated chat prompt and response" style={{ width: '100%', aspectRatio: `${W}/${H}`, overflow: 'hidden', borderRadius: 12 }}>
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'relative', fontFamily: 'var(--font-family)', opacity }}>
        <div style={{ position: 'absolute', inset: 16, borderRadius: 16, overflow: 'hidden', background: 'var(--color-surface)', boxShadow: 'var(--elevation-3)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--color-divider)', flexShrink: 0, opacity: headerEased }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: 2 }}>Chat</span>
              <div style={{ width: 28, height: 14, borderRadius: 7, background: '#22C55E', position: 'relative' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, right: 2 }} />
              </div>
            </div>
            <span style={{ fontSize: 9, fontWeight: 500, color: 'var(--color-text-secondary)', background: 'rgba(0,0,0,0.04)', padding: '2px 8px', borderRadius: 9999 }}>5 credits/query</span>
          </div>

          {/* Chat content */}
          <div style={{ flex: 1, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
            {time >= T.userMsgStart && (
              <div style={{ alignSelf: 'flex-end', maxWidth: '85%', opacity: userMsgEased, transform: `translateX(${userMsgX}px)` }}>
                <div style={{ background: 'var(--color-primary)', color: '#fff', fontSize: 10, fontWeight: 400, padding: '8px 14px', borderRadius: '14px 14px 4px 14px', lineHeight: 1.5 }}>{USER_QUESTION}</div>
              </div>
            )}
            {time >= T.typeStart - 0.33 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, opacity: avatarOpacity }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>A</span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-text-secondary)' }}>Aida</span>
                </div>
                <div style={{ paddingLeft: 26 }}>
                  {(typed.intro?.length ?? 0) > 0 && (
                    <p style={{ fontSize: 10, color: 'var(--color-text-secondary)', margin: '0 0 10px', lineHeight: 1.65 }}>
                      {typed.intro}{showCursor && currentSeg === 'intro' && <Caret />}
                    </p>
                  )}
                  {(typed.heading?.length ?? 0) > 0 && (
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 6px', lineHeight: 1.4 }}>
                      {typed.heading}{showCursor && currentSeg === 'heading' && <Caret />}
                    </p>
                  )}
                  {(typed.bodyPre?.length ?? 0) > 0 && (
                    <p style={{ fontSize: 10, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.65 }}>
                      {typed.bodyPre}
                      {bodyPreDone && citationScale > 0.01 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 16, padding: '0 5px', borderRadius: 4, background: 'rgba(91,111,204,0.12)', color: 'var(--color-primary)', fontSize: 9, fontWeight: 600, marginLeft: 4, verticalAlign: 'middle', transform: `scale(${Math.min(1, citationScale)})` }}>B</span>
                      )}
                      {showCursor && currentSeg === 'bodyPre' && <Caret />}
                      {(typed.bodyPost?.length ?? 0) > 0 && <>{typed.bodyPost}{showCursor && currentSeg === 'bodyPost' && <Caret />}</>}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action bar */}
          {time >= T.actionBarStart - 0.17 && (
            <div style={{ flexShrink: 0, padding: '10px 16px', borderTop: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center', gap: 12, opacity: actionBarEased, transform: `translateY(${actionBarY}px)` }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontSize: 18, fontWeight: 300, lineHeight: 1 }}>+</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {BUTTONS.map((label, i) => {
                  const btnProgress = Math.max(0, Math.min(1, (time - T.actionBarStart - i * 0.1) / 0.3))
                  const btnScale = 0.8 + 0.2 * (1 - Math.pow(1 - btnProgress, 3))
                  return (
                    <div key={label} style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', padding: '6px 14px', borderRadius: 9999, border: '1px solid var(--color-divider)', background: 'var(--color-surface)', opacity: btnProgress, transform: `scale(${btnScale})` }}>{label}</div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        <div style={{ position: 'absolute', bottom: 22, right: 26, fontSize: 8, fontWeight: 500, color: 'var(--color-text-secondary)', letterSpacing: '0.04em', opacity: 0.5 }}>beings.com</div>
      </div>
    </div>
  )
}
