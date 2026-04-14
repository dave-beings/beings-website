import { useAnimationLoop, lerp } from './shared/useAnimationLoop'

const T = {
  duration: 7.83,
  cardEnterEnd: 0.6,
  badgeStagger: 0.6,
  badgeStarts: [0.17, 0.77, 1.37, 1.97, 2.57, 3.17, 3.77],
  loopFadeStart: 7.0,
  loopFadeEnd: 7.67,
} as const

const CHARS_PER_SEC = 90
const TYPE_DELAY = 0.47

interface Badge {
  label: string
  imageSrc?: string
  icon?: React.ReactNode
}

const ClipboardListIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <rect x="6" y="5" width="12" height="15" rx="1.5" stroke="#fff" strokeWidth="1.5" fill="#fff" fillOpacity="0.15" />
    <path d="M9 5V4a1 1 0 011-1h4a1 1 0 011 1v1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 11h6M9 14h4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const LockIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="11" width="14" height="10" rx="2" fill="#fff" fillOpacity="0.2" stroke="#fff" strokeWidth="1.5" />
    <path d="M8 11V8a4 4 0 018 0v3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="16.5" r="1.5" fill="#fff" />
  </svg>
)

const EyeIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" fill="#fff" fillOpacity="0.2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" fill="#fff" stroke="#fff" strokeWidth="1" />
  </svg>
)

const BADGES: Badge[] = [
  { label: 'ISO 27001:2022', imageSrc: '/images/product/iso27001.png' },
  { label: 'HIPAA', imageSrc: '/images/product/hipaa.png' },
  { label: 'GDPR compliant', imageSrc: '/images/product/gdpr.png' },
  { label: 'SOC 2 infrastructure', imageSrc: '/images/product/soc2.png' },
  { label: 'Audit logs', icon: <ClipboardListIcon /> },
  { label: 'Data security', icon: <LockIcon /> },
  { label: 'Processing transparency', icon: <EyeIcon /> },
]

const W = 520
const H = 260

function BadgeItem({ badge, time, startTime }: { badge: Badge; time: number; startTime: number }) {
  if (time < startTime) return null

  const elapsed = time - startTime
  const popDuration = 0.6
  const pop = Math.min(1, elapsed / popDuration)
  const scale = 0.3 + 0.7 * (1 - Math.pow(1 - pop, 3))
  const opacity = Math.min(1, pop * 2)

  const typeStart = startTime + TYPE_DELAY
  const typeElapsed = Math.max(0, time - typeStart)
  const totalChars = Math.min(badge.label.length, Math.floor(typeElapsed * CHARS_PER_SEC))
  const typedText = badge.label.slice(0, totalChars)
  const isTypingDone = totalChars >= badge.label.length

  const blinkPhase = (time % 0.47) / 0.47
  const cursorOpacity = !isTypingDone && time >= typeStart ? (blinkPhase < 0.5 ? 1 : 0) : 0

  const doneTime = typeStart + badge.label.length / CHARS_PER_SEC
  const checkElapsed = time - doneTime
  const checkScale = checkElapsed > 0 ? Math.min(1, checkElapsed / 0.3) : 0
  const glowOpacity = checkScale

  return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          transform: `scale(${scale})`,
          opacity,
          width: '100%',
        }}
      >
        <div style={{ position: 'relative' }}>
          {badge.imageSrc ? (
            <div
              style={{
                width: 52, height: 52, borderRadius: '50%', background: '#fff',
                boxShadow: `0 2px 8px rgba(0,0,0,${0.08 + 0.06 * glowOpacity}), 0 1px 3px rgba(0,0,0,0.06)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid var(--color-divider)', overflow: 'hidden', padding: 4,
              }}
            >
              <img src={badge.imageSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
            </div>
          ) : (
            <div
              style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'linear-gradient(140deg, var(--color-primary-light) 0%, var(--color-primary-dark) 100%)',
                boxShadow: `0 4px 12px rgba(91,111,204,${0.3 + 0.25 * glowOpacity}), 0 2px 4px rgba(91,111,204,0.2)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid rgba(255,255,255,0.2)',
              }}
            >
              {badge.icon}
            </div>
          )}
          {checkScale > 0.01 && (
            <div
              style={{
                position: 'absolute', top: -3, right: -3, width: 17, height: 17,
                borderRadius: '50%', background: '#22C55E', border: '2px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: `scale(${checkScale})`, transformOrigin: 'center',
              }}
            >
              <span style={{ color: '#fff', fontSize: 8, fontWeight: 800, lineHeight: 1, fontFamily: 'var(--font-family)' }}>✓</span>
            </div>
          )}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-family)', fontSize: 9.5, fontWeight: 500,
            color: 'var(--color-text-primary)', textAlign: 'center', lineHeight: 1.35,
            maxWidth: 86, minHeight: 24,
          }}
        >
          {typedText}
          {cursorOpacity > 0 && (
            <span style={{ opacity: cursorOpacity, color: 'var(--color-primary)', fontWeight: 300, marginLeft: 1 }}>|</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ComplianceBadges() {
  const { time, containerRef, reducedMotion } = useAnimationLoop({ duration: T.duration })

  const cardPop = Math.min(1, time / T.cardEnterEnd)
  const cardScale = 0.96 + 0.04 * (1 - Math.pow(1 - cardPop, 3))
  const cardOpacity = Math.min(1, cardPop * 2)
  const loopFade = lerp(time, T.loopFadeStart, T.loopFadeEnd, 1, 0)
  const containerOpacity = Math.min(cardOpacity, loopFade)

  if (reducedMotion) {
    return (
      <div ref={containerRef} role="img" aria-label="Compliance certifications" style={{ width: '100%', aspectRatio: `${W}/${H}`, borderRadius: 12, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>ISO 27001 · HIPAA · GDPR · SOC 2</span>
      </div>
    )
  }

  return (
    <div ref={containerRef} role="img" aria-label="Animated compliance certifications" style={{ width: '100%', aspectRatio: `${W}/${H}`, overflow: 'hidden', borderRadius: 12 }}>
      <div style={{ width: W, height: H, transform: `scale(${containerRef.current ? containerRef.current.clientWidth / W : 1})`, transformOrigin: 'top left', position: 'relative', fontFamily: 'var(--font-family)', background: 'var(--color-background)' }}>
        <div
          style={{
            position: 'absolute', inset: 14, borderRadius: 16, overflow: 'hidden',
            background: 'var(--color-surface)', boxShadow: 'var(--elevation-3)',
            border: '1px solid var(--color-divider)', transform: `scale(${cardScale})`,
            opacity: containerOpacity, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '20px 16px 14px', gap: 10 }}>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around' }}>
              {BADGES.slice(0, 4).map((b, i) => <BadgeItem key={i} badge={b} time={time} startTime={T.badgeStarts[i]} />)}
            </div>
            <div style={{ display: 'flex', width: '75%', justifyContent: 'center' }}>
              {BADGES.slice(4).map((b, i) => <BadgeItem key={i + 4} badge={b} time={time} startTime={T.badgeStarts[i + 4]} />)}
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 26, right: 30, fontFamily: 'var(--font-family)', fontSize: 8, fontWeight: 500, color: 'var(--color-text-secondary)', letterSpacing: '0.04em', opacity: containerOpacity * 0.5 }}>
          beings.com
        </div>
      </div>
    </div>
  )
}
