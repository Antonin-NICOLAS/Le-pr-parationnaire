import { Check, HelpCircle } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import useSecurityQuestions from '../../hooks/TwoFactor/SecurityQuestions'
import type { SecurityQuestion } from '../../types/user'
import CustomInput from '../ui/CustomInput'
import PrimaryButton from '../ui/PrimaryButton'

interface SecurityQuestionsSetupProps {
  onComplete: () => void
  onSkip: () => void
}

const SecurityQuestionsSetup: React.FC<SecurityQuestionsSetupProps> = ({
  onComplete,
  onSkip,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [availableQuestions, setAvailableQuestions] = useState<
    SecurityQuestion[]
  >([])
  const [selectedQuestions, setSelectedQuestions] = useState<
    SecurityQuestion[]
  >([
    { id: '', question: '', answer: '' },
    { id: '', question: '', answer: '' },
  ])

  const { getAvailableQuestions, setSecurityQuestions } = useSecurityQuestions()

  useEffect(() => {
    const loadQuestions = async () => {
      const questions = await getAvailableQuestions()
      setAvailableQuestions(questions)
    }
    loadQuestions()
  }, [])

  const handleQuestionSelect = (index: number, questionId: string) => {
    const question = availableQuestions.find((q) => q.id === questionId)
    if (question) {
      const newQuestions = [...selectedQuestions]
      newQuestions[index] = {
        id: question.id,
        question: question.question,
        answer: '',
      }
      setSelectedQuestions(newQuestions)
    }
  }

  const handleAnswerChange = (index: number, answer: string) => {
    const newQuestions = [...selectedQuestions]
    newQuestions[index].answer = answer
    setSelectedQuestions(newQuestions)
  }

  const handleSubmit = async () => {
    if (!selectedQuestions.every((q) => q.id && q.answer!.trim())) {
      return
    }

    setIsLoading(true)
    const success = await setSecurityQuestions(selectedQuestions)
    if (success) {
      onComplete()
    }
    setIsLoading(false)
  }

  const isValid =
    selectedQuestions.every((q) => q.id && q.answer!.trim()) &&
    selectedQuestions[0].id !== selectedQuestions[1].id

  const getAvailableQuestionsForSelect = (currentIndex: number) => {
    const otherSelectedId = selectedQuestions[1 - currentIndex]?.id
    return availableQuestions.filter((q) => q.id !== otherSelectedId)
  }

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20'>
          <HelpCircle className='h-8 w-8 text-blue-600 dark:text-blue-400' />
        </div>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
          Questions de sécurité
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          Configurez 2 questions de sécurité pour renforcer la protection de
          votre compte
        </p>
      </div>

      <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/30 dark:bg-blue-900/10'>
        <h4 className='mb-2 font-medium text-blue-900 dark:text-blue-100'>
          Conseils pour des réponses sécurisées :
        </h4>
        <ul className='space-y-1 text-sm text-blue-800 dark:text-blue-200'>
          <li>• Choisissez des réponses que vous seul connaissez</li>
          <li>• Évitez les informations facilement trouvables en ligne</li>
          <li>• Utilisez des réponses cohérentes (majuscules, accents...)</li>
          <li>• Ne partagez jamais vos réponses avec personne</li>
        </ul>
      </div>

      <div className='space-y-6'>
        {selectedQuestions.map((selectedQuestion, index) => (
          <div key={index} className='space-y-3'>
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Question {index + 1}
              </label>
              <select
                value={selectedQuestion.id}
                onChange={(e) => handleQuestionSelect(index, e.target.value)}
                className='focus:border-primary-500 w-full rounded-lg border-2 border-gray-200 bg-white p-3 text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'
              >
                <option value=''>Sélectionnez une question...</option>
                {getAvailableQuestionsForSelect(index).map((question) => (
                  <option key={question.id} value={question.id}>
                    {question.question}
                  </option>
                ))}
              </select>
            </div>

            {selectedQuestion.id && (
              <CustomInput
                label='Votre réponse'
                value={selectedQuestion.answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder='Entrez votre réponse...'
                autoComplete='off'
              />
            )}
          </div>
        ))}
      </div>

      <div className='flex space-x-3'>
        <PrimaryButton
          onClick={handleSubmit}
          loading={isLoading}
          disabled={!isValid}
          fullWidth
          icon={Check}
        >
          Configurer les questions
        </PrimaryButton>
        <PrimaryButton variant='outline' onClick={onSkip} fullWidth>
          Ignorer pour l'instant
        </PrimaryButton>
      </div>
    </div>
  )
}

export default SecurityQuestionsSetup
