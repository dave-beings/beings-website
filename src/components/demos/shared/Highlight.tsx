import { lerp } from './useAnimationLoop'

interface FileHighlightProps {
  time: number
  appearTime: number
  fadeOutTime: number
  x: number
  y: number
  width: number
  height: number
}

const FADE_IN = 0.27
const FADE_OUT = 0.67

export function FileHighlight({ time, appearTime, fadeOutTime, x, y, width, height }: FileHighlightProps) {
  if (time < appearTime) return null

  const fadeIn = lerp(time, appearTime, appearTime + FADE_IN, 0, 1)
  const fadeOut = lerp(time, fadeOutTime, fadeOutTime + FADE_OUT, 1, 0)
  const opacity = Math.min(fadeIn, fadeOut)
  if (opacity <= 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        background: 'rgba(91, 111, 204, 0.08)',
        borderLeft: '3px solid var(--color-primary)',
        borderRadius: 4,
        opacity,
        pointerEvents: 'none',
      }}
    />
  )
}

interface ButtonHighlightProps {
  time: number
  clickTime: number
  x: number
  y: number
  width: number
  height: number
}

export function ButtonHighlight({ time, clickTime, x, y, width, height }: ButtonHighlightProps) {
  if (time < clickTime) return null

  const elapsed = time - clickTime
  const duration = 0.67

  if (elapsed > duration) return null

  const progress = elapsed / duration
  const scale = progress < 0.4 ? lerp(progress, 0, 0.4, 1, 0.95) : lerp(progress, 0.4, 1, 0.95, 1)
  const opacity = elapsed < 0.27 ? 0.8 : lerp(elapsed, 0.27, duration, 0.6, 0)

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        background: 'rgba(91, 111, 204, 0.15)',
        borderRadius: 6,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'center',
        pointerEvents: 'none',
      }}
    />
  )
}
