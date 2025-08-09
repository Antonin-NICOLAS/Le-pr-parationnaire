import type React from 'react'
import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface CountdownTimerProps {
  initialSeconds: number
  onComplete?: () => void
  className?: string
  showIcon?: boolean
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialSeconds,
  onComplete,
  className = '',
  showIcon = true,
}) => {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    setSeconds(initialSeconds)
  }, [initialSeconds])

  useEffect(() => {
    if (seconds <= 0) {
      if (onComplete) onComplete()
      return
    }

    const timer = setTimeout(() => {
      setSeconds(seconds - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [seconds, onComplete])

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const remainingSeconds = time % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (seconds <= 0) return null

  return (
    <div
      className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ${className}`}
    >
      {showIcon && <Clock size={16} />}
      <span>Resend available in {formatTime(seconds)}</span>
    </div>
  )
}

export default CountdownTimer
