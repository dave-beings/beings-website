import { useRef, useEffect, useState } from 'react'
import { useAnimationLoop, lerp } from './shared/useAnimationLoop'

const T = {
  duration: 12.0,
  panelEntranceEnd: 0.83,
  headerAppearStart: 0.33,
  headerAppearEnd: 0.73,
  firstFileStart: 1.0,
  staggerInterval: 0.73,
  fileCount: 7,
  counterStart: 6.5,
  counterEnd: 8.0,
  clearAppearTime: 7.67,
  loopFadeStart: 11.17,
  loopFadeEnd: 11.97,
} as const

type FileType = 'pdf' | 'video' | 'txt'
const FILE_DATA: { name: string; size: string; type: FileType }[] = [
  { name: 'veo-fajc-yoj (2025-11-04 11...', size: '2.08 Mb', type: 'video' },
  { name: 'BrightBank_Focus_Group_T...', size: '4.3 Kb', type: 'pdf' },
  { name: 'Anonymised transcript_010...', size: '4.3 Kb', type: 'pdf' },
  { name: 'user_research_summary.pdf', size: '3.57 Kb', type: 'pdf' },
  { name: 'Focus_Group_Questions.pdf...', size: '4.3 Kb', type: 'pdf' },
  { name: 'recall-record-43a94fba-b5...', size: '33.21 Kb', type: 'txt' },
  { name: 'Compliance Guidelines.pdf', size: '4.3 Kb', type: 'pdf' },
]

const SUCCESS_GREEN = '#22C55E'
const CHECK_DELAY = 0.6
const PROGRESS_DELAY = 0.2
const PROGRESS_DURATION = 0.4

const W = 480
const H = 640

function FileTypeIcon({ type, size = 40 }: { type: FileType; size?: number }) {
  const r = size * 0.2
  const colors = { pdf: { bg: '#FEE2E2', fg: '#EF4444', text: 'PDF' }, video: { bg: '#DBEAFE', fg: '#3B82F6', text: '' }, txt: { bg: '#F3F4F6', fg: '#6B7280', text: 'TXT' } }
  const c = colors[type]
  return (
    <div style={{ width: size, height: size, borderRadius: r, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {type === 'video' ? (
        <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 20 20" fill="none"><path d="M6 3.5V16.5C6 17.3 6.9 17.8 7.6 17.3L17.1 10.8C17.7 10.4 17.7 9.6 17.1 9.2L7.6 2.7C6.9 2.2 6 2.7 6 3.5Z" fill={c.fg} /></svg>
      ) : (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 20 20" fill="none"><path d="M4 2C4 .9 4.9 0 6 0H12L18 6V18C18 19.1 17.1 20 16 20H6C4.9 20 4 19.1 4 18V2Z" fill={c.fg} opacity={0.2} /><text x="10" y="15" textAnchor="middle" fill={c.fg} fontSize="6.5" fontWeight="700" fontFamily="system-ui">{c.text}</text></svg>
      )}
    </div>
  )
}

function FileRow({ file, time, startTime }: { file: typeof FILE_DATA[0]; time: number; startTime: number }) {
  const elapsed = time - startTime
  if (elapsed < -0.03) return null

  const slideProgress = Math.max(0, Math.min(1, elapsed / 0.27))
  const slideEased = 1 - Math.pow(1 - slideProgress, 3)
  const translateY = 24 * (1 - slideEased)

  const progressFill = lerp(elapsed, PROGRESS_DELAY, PROGRESS_DELAY + PROGRESS_DURATION, 0, 100)
  const isUploaded = elapsed >= CHECK_DELAY * 0.9
  const progressOpacity = isUploaded ? Math.max(0, 1 - (elapsed - CHECK_DELAY * 0.9) / 0.17) : 1

  const checkProgress = Math.max(0, Math.min(1, (elapsed - CHECK_DELAY) / 0.33))
  const checkScale = 1 - Math.pow(1 - checkProgress, 3)

  const dotCount = Math.floor(((elapsed * 2.5) % 1.2) / 0.4) + 1
  const uploadingText = 'Uploading' + '.'.repeat(Math.min(dotCount, 3))

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', opacity: slideEased, transform: `translateY(${translateY}px)`, position: 'relative' }}>
      <FileTypeIcon type={file.type} />
      <div style={{ flex: 1, marginLeft: 14, minWidth: 0, overflow: 'hidden' }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#101A29', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
        <div style={{ fontSize: 12, fontWeight: 400, color: '#9CA3AF', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>{file.size}</span>
          <span style={{ color: '#D1D5DB' }}>{'\u00B7'}</span>
          <span style={{ color: isUploaded ? SUCCESS_GREEN : '#9CA3AF' }}>{isUploaded ? 'Uploaded' : uploadingText}</span>
        </div>
        {progressOpacity > 0.01 && (
          <div style={{ marginTop: 4, height: 3, borderRadius: 2, background: '#E5E7EB', overflow: 'hidden', opacity: progressOpacity }}>
            <div style={{ height: '100%', width: `${progressFill}%`, borderRadius: 2, background: SUCCESS_GREEN }} />
          </div>
        )}
      </div>
      <div style={{ width: 28, height: 28, borderRadius: 14, background: SUCCESS_GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 12, transform: `scale(${checkScale})`, opacity: checkScale }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7.5L5.5 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </div>
  )
}

export default function FileUploadDemo() {
  const { time, containerRef, reducedMotion } = useAnimationLoop({ duration: T.duration })
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!wrapperRef.current) return
    const obs = new ResizeObserver(([e]) => setScale(e.contentRect.width / W))
    obs.observe(wrapperRef.current)
    return () => obs.disconnect()
  }, [])

  const entranceFade = lerp(time, 0, 0.5, 0, 1)
  const loopFade = lerp(time, T.loopFadeStart, T.loopFadeEnd, 1, 0)
  const opacity = Math.min(entranceFade, loopFade)

  const panelProgress = Math.max(0, Math.min(1, time / T.panelEntranceEnd))
  const panelEased = 1 - Math.pow(1 - panelProgress, 3)
  const panelY = 30 * (1 - panelEased)

  const headerOpacity = lerp(time, T.headerAppearStart, T.headerAppearEnd, 0, 1)
  const headerY = lerp(time, T.headerAppearStart, T.headerAppearEnd, 6, 0)

  // Count completed files
  const completionTimes: number[] = []
  for (let i = 0; i < T.fileCount; i++) {
    const completeAt = T.firstFileStart + i * T.staggerInterval + CHECK_DELAY + 0.2
    completionTimes.push(completeAt)
    if (i === 1 || i === 4) completionTimes.push(completeAt + T.staggerInterval * 0.5)
  }
  completionTimes.sort((a, b) => a - b)
  const filesUploaded = completionTimes.filter(t => time >= t).length

  const counterOpacity = lerp(time, T.counterStart, T.counterStart + 0.4, 0, 1)
  const counterProgress = lerp(time, T.counterStart, T.counterEnd, 0, 9)
  const displayCount = Math.round(counterProgress)
  const clearOpacity = lerp(time, T.clearAppearTime, T.clearAppearTime + 0.5, 0, 1)

  if (reducedMotion) {
    return <div ref={wrapperRef} role="img" aria-label="File upload notification" style={{ width: '100%', aspectRatio: `${W}/${H}`, borderRadius: 12, background: 'var(--color-surface)', border: '1px solid var(--color-divider)' }} />
  }

  return (
    <div ref={(n) => { (wrapperRef as any).current = n; (containerRef as any).current = n }} role="img" aria-label="Animated file upload notification" style={{ width: '100%', aspectRatio: `${W}/${H}`, overflow: 'hidden', borderRadius: 12 }}>
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'relative', fontFamily: 'var(--font-family)', opacity, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background)' }}>
        <div style={{ width: W - 40, maxHeight: H - 40, borderRadius: 16, background: 'var(--color-surface)', boxShadow: 'var(--elevation-3)', border: '1px solid var(--color-divider)', overflow: 'hidden', transform: `translateY(${panelY}px)`, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--color-divider)', opacity: headerOpacity, transform: `translateY(${headerY}px)` }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 8V18M14 8L10 12M14 8L18 12" stroke={SUCCESS_GREEN} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M7.5 18.5C5 18.5 3 16.5 3 14C3 11.8 4.6 10 6.7 9.6C7.5 6.4 10.5 4 14 4C18.2 4 21.5 7 21.7 10.8C24 11.5 25.5 13.5 25.5 16C25.5 19 23 21.5 20 21.5H7.5" stroke={SUCCESS_GREEN} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span style={{ marginLeft: 10, fontSize: 16, fontWeight: 600, color: '#101A29', flex: 1 }}>{filesUploaded} {filesUploaded === 1 ? 'file' : 'files'} uploaded</span>
          </div>

          {/* File rows */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {FILE_DATA.map((file, i) => (
              <FileRow key={i} file={file} time={time} startTime={T.firstFileStart + i * T.staggerInterval} />
            ))}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid var(--color-divider)', opacity: counterOpacity }}>
            <span style={{ fontSize: 14, fontWeight: 400, color: '#6B7280' }}>{displayCount} completed</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: clearOpacity }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#6B7280' }}>Clear</span>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 10, right: 16, fontSize: 8, fontWeight: 500, color: 'var(--color-text-secondary)', letterSpacing: '0.04em', opacity: 0.5 }}>beings.com</div>
      </div>
    </div>
  )
}
