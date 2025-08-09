import type React from 'react'
import { useState, useEffect } from 'react'
import { Shield, Check, X, AlertCircle } from 'lucide-react'
import type { PasswordStrength } from '../../types/auth'

interface PasswordStrengthMeterProps {
  password: string
  onStrengthChange?: (strength: PasswordStrength) => void
  showRequirements?: boolean
  showScore?: boolean
  className?: string
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  onStrengthChange,
  showRequirements = true,
  showScore = true,
  className = '',
}) => {
  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    level: 'very-weak',
    requirements: {
      length: false,
      lowercase: false,
      uppercase: false,
      number: false,
      special: false,
      sequential: true,
    },
  })

  const halfFillRanges = [
    { min: 5, max: 15, segment: 1 },
    { min: 25, max: 35, segment: 2 },
    { min: 45, max: 55, segment: 3 },
    { min: 65, max: 75, segment: 4 },
    { min: 85, max: 95, segment: 5 },
  ]

  const isHalfFilled = (segment: number, score: number): boolean => {
    const range = halfFillRanges.find((r) => r.segment === segment)
    return range ? score >= range.min && score <= range.max : false
  }

  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    if (!pwd) {
      return {
        score: 0,
        level: 'very-weak',
        requirements: {
          length: false,
          lowercase: false,
          uppercase: false,
          number: false,
          special: false,
          sequential: true,
        },
      }
    }

    const requirements = {
      length: pwd.length >= 8,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^a-zA-Z0-9]/.test(pwd),
      sequential:
        !/(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(
          pwd,
        ),
    }

    let score = 0
    let bonusPoints = 0

    // Base requirements (15 points each)
    if (requirements.length) score += 15
    if (requirements.lowercase) score += 15
    if (requirements.uppercase) score += 15
    if (requirements.number) score += 15
    if (requirements.special) score += 15

    // Bonus points for additional security
    if (pwd.length >= 12) bonusPoints += 10
    if (pwd.length >= 16) bonusPoints += 5
    if (requirements.sequential) bonusPoints += 5
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) bonusPoints += 5

    // Penalty for common patterns
    if (/(password|123456|qwerty|abc123|admin|user)/i.test(pwd)) {
      score -= 20
    }

    score = Math.min(score + bonusPoints, 100)
    score = Math.max(score, 0)

    let level: PasswordStrength['level'] = 'very-weak'
    if (score >= 85) level = 'very-strong'
    else if (score >= 70) level = 'strong'
    else if (score >= 50) level = 'medium'
    else if (score >= 25) level = 'weak'

    return { score, level, requirements }
  }

  useEffect(() => {
    const newStrength = calculatePasswordStrength(password)
    setStrength(newStrength)
    if (onStrengthChange) {
      onStrengthChange(newStrength)
    }
  }, [password, onStrengthChange])

  const getStrengthConfig = () => {
    const configs = {
      'very-weak': {
        color: '#ef4444',
        text: 'Very Weak',
        icon: X,
        gradient: 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)',
      },
      weak: {
        color: '#f97316',
        text: 'Weak',
        icon: AlertCircle,
        gradient: 'linear-gradient(90deg, #f97316 0%, #fb923c 100%)',
      },
      medium: {
        color: '#eab308',
        text: 'Medium',
        icon: Shield,
        gradient: 'linear-gradient(90deg, #eab308 0%, #fbbf24 100%)',
      },
      strong: {
        color: '#22c55e',
        text: 'Strong',
        icon: Shield,
        gradient: 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)',
      },
      'very-strong': {
        color: '#10b981',
        text: 'Very Strong',
        icon: Check,
        gradient: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
      },
    }
    return configs[strength.level]
  }

  const config = getStrengthConfig()
  const IconComponent = config.icon

  if (!password) return null

  return (
    <div
      className={`rounded-lg border border-gray-200/50 bg-gradient-to-br from-white/90 to-gray-50/90 p-4 backdrop-blur-sm transition-all duration-300 dark:border-gray-700/50 dark:from-gray-800/90 dark:to-gray-900/90 ${className}`}
    >
      {/* Main strength indicator */}
      <div className='mb-3 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <IconComponent size={16} style={{ color: config.color }} />
          <span
            className='text-sm font-semibold'
            style={{ color: config.color }}
          >
            {config.text}
          </span>
          {showScore && (
            <span
              className='rounded bg-white/80 px-2 py-1 text-xs font-medium backdrop-blur-sm dark:bg-gray-800/80'
              style={{ color: config.color }}
            >
              {strength.score}%
            </span>
          )}
        </div>
      </div>

      {/* Visual strength bars */}
      <div className='mb-4 flex h-1.5 gap-1'>
        {[1, 2, 3, 4, 5].map((segment) => {
          const isFull = strength.score >= segment * 20
          const isHalf = isHalfFilled(segment, strength.score)

          return (
            <div
              key={segment}
              className='duration-400 relative flex-1 overflow-hidden rounded-full transition-all ease-out'
              style={{
                background: isHalf
                  ? `linear-gradient(to right, ${config.color} 50%, #e5e7eb 50%)`
                  : isFull
                    ? config.gradient
                    : '#e5e7eb',
              }}
            >
              {(isFull || isHalf) && (
                <div className='absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/40 to-transparent' />
              )}
            </div>
          )
        })}
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <div className='grid grid-cols-2 gap-2'>
          {[
            { key: 'length', text: 'At least 8 characters' },
            { key: 'lowercase', text: 'Lowercase letter' },
            { key: 'uppercase', text: 'Uppercase letter' },
            { key: 'number', text: 'Number' },
            { key: 'special', text: 'Special character' },
          ].map(({ key, text }) => {
            const isMet =
              strength.requirements[key as keyof typeof strength.requirements]
            return (
              <div
                key={key}
                className={`flex items-center gap-2 rounded p-2 text-xs font-medium transition-all duration-300 ${
                  isMet
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {isMet ? (
                  <Check size={14} className='text-emerald-600' />
                ) : (
                  <X size={14} className='text-red-500' />
                )}
                <span>{text}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PasswordStrengthMeter
