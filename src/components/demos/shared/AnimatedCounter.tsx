import { lerp } from './useAnimationLoop'

interface AnimatedCounterProps {
  time: number
  startTime: number
  endTime: number
  from?: number
  to: number
  /** Optional formatter — defaults to Math.floor */
  format?: (value: number) => string
}

export function AnimatedCounter({
  time,
  startTime,
  endTime,
  from = 0,
  to,
  format = (v) => String(Math.floor(v)),
}: AnimatedCounterProps) {
  const value = lerp(time, startTime, endTime, from, to)
  return <>{format(value)}</>
}
