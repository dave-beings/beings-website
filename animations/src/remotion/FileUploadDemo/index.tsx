import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { colors, fonts, shadows } from '../../components/marketing/design-tokens'
import { NotificationHeader } from './NotificationHeader'
import { NotificationFooter } from './NotificationFooter'
import { FileRow, FILE_COMPLETE_OFFSET } from './FileRow'
import type { FileType } from './FileTypeIcon'

/**
 * \u2500\u2500 TIMING CONFIG \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
 * All values are frame numbers at 30fps (so 30 = 1 second).
 *
 * Phase 1: Panel entrance         \u2014 frames 0\u201325    (0.83s)
 * Phase 2: Header appear          \u2014 frames 10\u201322  (0.4s)
 * Phase 3: Files stagger in       \u2014 frames 30\u2013186 (5.2s)
 * Phase 4: Footer + counter       \u2014 frames 195\u2013240 (1.5s)
 * Phase 5: Hold                   \u2014 frames 240\u2013334 (3.1s)
 * Phase 6: Loop fade              \u2014 frames 335\u2013359 (0.8s)
 * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
 */
export const TIMING = {
  // Panel entrance
  panelEntranceEnd: 25,

  // Header
  headerAppearStart: 10,
  headerAppearEnd: 22,

  // File stagger (22-frame gap between each file)
  firstFileStart: 30,
  staggerInterval: 22,
  fileCount: 7,

  // Footer
  counterStart: 195,
  counterEnd: 240,
  clearAppearFrame: 230,

  // Loop fade
  loopFadeStart: 335,
  loopFadeEnd: 359,
} as const

export const COMPOSITION_WIDTH = 480
export const COMPOSITION_HEIGHT = 640
export const FPS = 30
export const DURATION_IN_FRAMES = 360

export interface FileDataItem {
  name: string
  size: string
  type: FileType
}

export const FILE_DATA: FileDataItem[] = [
  { name: 'veo-fajc-yoj (2025-11-04 11...', size: '2.08 Mb', type: 'video' },
  { name: 'BrightBank_Focus_Group_T...', size: '4.3 Kb', type: 'pdf' },
  { name: 'Anonymised transcript_010...', size: '4.3 Kb', type: 'pdf' },
  { name: 'user_research_summary.pdf', size: '3.57 Kb', type: 'pdf' },
  { name: 'Focus_Group_Questions.pdf...', size: '4.3 Kb', type: 'pdf' },
  { name: 'recall-record-43a94fba-b5...', size: '33.21 Kb', type: 'txt' },
  { name: 'Compliance Guidelines.pdf', size: '4.3 Kb', type: 'pdf' },
]

/** Total files shown in header/footer (some may be off-screen) */
const TOTAL_FILES_COUNT = 9

export const FileUploadDemo: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // ── Overall loop fades ──
  const entranceFade = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const loopFade = interpolate(
    frame,
    [TIMING.loopFadeStart, TIMING.loopFadeEnd],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )

  // ── Panel slide-up entrance ──
  const panelSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: TIMING.panelEntranceEnd,
  })
  const panelTranslateY = interpolate(panelSpring, [0, 1], [30, 0])

  // ── Count completed files ──
  // 9 explicit completion frames: 7 visible + 2 virtual "off-screen" files
  // interleaved so the counter increments cleanly 1-through-9.
  const completionFrames: number[] = []
  for (let i = 0; i < TIMING.fileCount; i++) {
    const completeAt = TIMING.firstFileStart + i * TIMING.staggerInterval + FILE_COMPLETE_OFFSET
    completionFrames.push(completeAt)
    // Insert a virtual file between files 2-3 and files 5-6
    if (i === 1 || i === 4) {
      completionFrames.push(completeAt + Math.round(TIMING.staggerInterval * 0.5))
    }
  }
  completionFrames.sort((a, b) => a - b)
  const filesUploaded = completionFrames.filter((f) => frame >= f).length

  return (
    <AbsoluteFill
      style={{
        background: colors.surface.gray50,
        fontFamily: fonts.sans,
        opacity: Math.min(entranceFade, loopFade),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Main notification card */}
      <div
        style={{
          width: COMPOSITION_WIDTH - 40,
          maxHeight: COMPOSITION_HEIGHT - 40,
          borderRadius: 16,
          background: colors.surface.white,
          boxShadow: shadows.elevated,
          border: `1px solid ${colors.surface.gray200}`,
          overflow: 'hidden',
          transform: `translateY(${panelTranslateY}px)`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <NotificationHeader
          appearStart={TIMING.headerAppearStart}
          appearEnd={TIMING.headerAppearEnd}
          filesUploaded={filesUploaded}
        />

        {/* File rows */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {FILE_DATA.map((file, i) => (
            <FileRow
              key={i}
              fileName={file.name}
              fileSize={file.size}
              fileType={file.type}
              startFrame={TIMING.firstFileStart + i * TIMING.staggerInterval}
            />
          ))}
        </div>

        {/* Footer */}
        <NotificationFooter
          counterStart={TIMING.counterStart}
          counterEnd={TIMING.counterEnd}
          totalFiles={TOTAL_FILES_COUNT}
          clearAppearFrame={TIMING.clearAppearFrame}
        />
      </div>

      {/* beings.com watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          right: 16,
          fontFamily: fonts.sans,
          fontSize: 8,
          fontWeight: 500,
          color: colors.text.muted,
          letterSpacing: '0.04em',
          opacity: 0.5,
        }}
      >
        beings.com
      </div>
    </AbsoluteFill>
  )
}
