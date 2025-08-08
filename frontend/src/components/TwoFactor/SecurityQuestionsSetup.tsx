import React, { useState, useEffect } from 'react'
import { HelpCircle, Check } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import CustomInput from '../ui/CustomInput'
import useSecurityQuestions from '../../hooks/TwoFactor/SecurityQuestions'
import type {
  SecurityQuestion,
  UserSecurityQuestion,
} from '../../types/twoFactor'

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
    UserSecurityQuestion[]
  >([
    { questionId: '', question: '', answer: '' },
    { questionId: '', question: '', answer: '' },
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
        questionId: question.id,
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
    if (!selectedQuestions.every((q) => q.questionId && q.answer.trim())) {
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
    selectedQuestions.every((q) => q.questionId && q.answer.trim()) &&
    selectedQuestions[0].questionId !== selectedQuestions[1].questionId

  const getAvailableQuestionsForSelect = (currentIndex: number) => {
    const otherSelectedId = selectedQuestions[1 - currentIndex]?.questionId
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

      <div className='bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4'>
        <h4 className='font-medium text-blue-900 dark:text-blue-100 mb-2'>
          Conseils pour des réponses sécurisées :
        </h4>
        <ul className='text-sm text-blue-800 dark:text-blue-200 space-y-1'>
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
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Question {index + 1}
              </label>
              <select
                value={selectedQuestion.questionId}
                onChange={(e) => handleQuestionSelect(index, e.target.value)}
                className='w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:outline-none'
              >
                <option value=''>Sélectionnez une question...</option>
                {getAvailableQuestionsForSelect(index).map((question) => (
                  <option key={question.id} value={question.id}>
                    {question.question}
                  </option>
                ))}
              </select>
            </div>

            {selectedQuestion.questionId && (
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
