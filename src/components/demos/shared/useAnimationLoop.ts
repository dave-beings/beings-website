import { useState, useEffect, useRef, useCallback } from 'react'

interface UseAnimationLoopOptions {
  /** Total loop duration in seconds */
  duration: number
  /** Pause when element is out of viewport (default: true) */
  pauseOffscreen?: boolean
}

/**
 * Drives a looping animation by returning elapsed time in seconds.
 * Replaces Remotion's useCurrentFrame() — components derive all
 * visual state from the returned `time` value.
 *
 * Respects prefers-reduced-motion by never starting the loop.
 */
export function useAnimationLoop({ duration, pauseOffscreen = true }: UseAnimationLoopOptions) {
  const [time, setTime] = useState(0)
  const rafRef = useRef<number>(0)
  const startRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isVisibleRef = useRef(!pauseOffscreen)
  const prefersReducedMotion = useRef(false)

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (!pauseOffscreen || !containerRef.current) {
      isVisibleRef.current = true
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting },
      { threshold: 0.1 }
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [pauseOffscreen])

  const tick = useCallback((now: number) => {
    if (prefersReducedMotion.current) return

    if (!isVisibleRef.current) {
      startRef.current = 0
      rafRef.current = requestAnimationFrame(tick)
      return
    }

    if (startRef.current === 0) startRef.current = now

    const elapsed = (now - startRef.current) / 1000
    const loopedTime = elapsed % duration

    setTime(loopedTime)
    rafRef.current = requestAnimationFrame(tick)
  }, [duration])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tick])

  return { time, containerRef, reducedMotion: prefersReducedMotion.current }
}

/**
 * Linear interpolation clamped to [from, to].
 * Equivalent to Remotion's interpolate() with clamp extrapolation.
 */
export function lerp(
  time: number,
  startTime: number,
  endTime: number,
  from: number,
  to: number,
): number {
  if (startTime === endTime) return time >= startTime ? to : from
  const t = Math.max(0, Math.min(1, (time - startTime) / (endTime - startTime)))
  return from + t * (to - from)
}
