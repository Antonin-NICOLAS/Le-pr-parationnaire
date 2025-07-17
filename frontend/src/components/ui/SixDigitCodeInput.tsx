'use client'

import type React from 'react'
import {
    useState,
    useRef,
    useEffect,
    type KeyboardEvent,
    type ClipboardEvent,
} from 'react'

interface SixDigitCodeInputProps {
    value: string[]
    onChange: (value: string[]) => void
    onComplete?: (code: string) => void
    disabled?: boolean
    error?: boolean
    autoFocus?: boolean
    className?: string
}

const SixDigitCodeInput: React.FC<SixDigitCodeInputProps> = ({
    value,
    onChange,
    onComplete,
    disabled = false,
    error = false,
    autoFocus = false,
    className = '',
}) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const [focusedIndex, setFocusedIndex] = useState<number>(-1)

    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            inputRefs.current[0].focus()
            setFocusedIndex(0)
        }
    }, [autoFocus])

    useEffect(() => {
        const code = value.join('')
        if (code.length === 6 && onComplete) {
            onComplete(code)
        }
    }, [value, onComplete])

    const handleInputChange = (index: number, inputValue: string) => {
        if (disabled) return

        // Only allow single digit/letter
        const newValue = inputValue.slice(-1)

        if (newValue && !/^[a-zA-Z0-9]$/.test(newValue)) return

        const newValues = [...value]
        newValues[index] = newValue.toUpperCase()
        onChange(newValues)

        // Auto-focus next input
        if (newValue && index < 5) {
            inputRefs.current[index + 1]?.focus()
            setFocusedIndex(index + 1)
        }
    }

    const handleKeyDown = (
        index: number,
        e: KeyboardEvent<HTMLInputElement>
    ) => {
        if (disabled) return

        if (e.key === 'Backspace') {
            e.preventDefault()
            const newValues = [...value]

            if (newValues[index]) {
                // Clear current input
                newValues[index] = ''
                onChange(newValues)
            } else if (index > 0) {
                // Move to previous input and clear it
                newValues[index - 1] = ''
                onChange(newValues)
                inputRefs.current[index - 1]?.focus()
                setFocusedIndex(index - 1)
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus()
            setFocusedIndex(index - 1)
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus()
            setFocusedIndex(index + 1)
        }
    }

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        if (disabled) return

        e.preventDefault()
        const pastedData = e.clipboardData
            .getData('text')
            .replace(/\s/g, '')
            .toUpperCase()

        if (pastedData && /^[A-Z0-9]{1,6}$/.test(pastedData)) {
            const newValues = [...value]
            const chars = pastedData.split('')

            chars.forEach((char, index) => {
                if (index < 6) {
                    newValues[index] = char
                }
            })

            onChange(newValues)

            // Focus the next empty input or the last input
            const nextIndex = Math.min(chars.length, 5)
            inputRefs.current[nextIndex]?.focus()
            setFocusedIndex(nextIndex)
        }
    }

    const handleFocus = (index: number) => {
        setFocusedIndex(index)
    }

    const handleBlur = () => {
        setFocusedIndex(-1)
    }

    return (
        <div className={`flex justify-center gap-3 ${className}`}>
            {Array.from({ length: 6 }, (_, index) => (
                <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="text"
                    autoComplete="one-time-code"
                    value={value[index] || ''}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={() => handleFocus(index)}
                    onBlur={handleBlur}
                    disabled={disabled}
                    className={`focus:ring-primary-500/50 h-14 w-12 rounded-lg border-2 bg-white text-center text-xl font-bold transition-all duration-200 focus:outline-none focus:ring-2 dark:bg-gray-800 ${
                        error
                            ? 'border-red-500 text-red-600 dark:text-red-400'
                            : focusedIndex === index
                              ? 'border-primary-500 text-primary-600 dark:text-primary-400 scale-105 shadow-lg'
                              : value[index]
                                ? 'border-primary-300 text-gray-900 dark:text-gray-100'
                                : 'border-gray-200 text-gray-500 dark:border-gray-600'
                    } ${
                        disabled
                            ? 'cursor-not-allowed bg-gray-100 opacity-50 dark:bg-gray-700'
                            : 'hover:border-gray-300 dark:hover:border-gray-500'
                    } `}
                    maxLength={1}
                    aria-label={`Digit ${index + 1}`}
                />
            ))}
        </div>
    )
}

export default SixDigitCodeInput
