import axios from 'axios'
import { toast } from 'sonner'
import type {
  SecurityQuestion,
  UserSecurityQuestion,
} from '../../types/twoFactor'

import.meta.env.VITE_2FA =
  import.meta.env.VITE_NODE_ENV === 'development'
    ? '/auth/2fa'
    : '/api/auth/2fa'

const useSecurityQuestions = () => {
  const getAvailableQuestions = async (): Promise<SecurityQuestion[]> => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_2FA}/security-questions/available`,
        { withCredentials: true },
      )
      return data.questions || []
    } catch (error) {
      toast.error('Erreur lors du chargement des questions')
      return []
    }
  }

  const setSecurityQuestions = async (questions: UserSecurityQuestion[]) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_2FA}/security-questions/set`,
        { questions },
        { withCredentials: true },
      )
      if (data.success) {
        toast.success('Questions de sécurité configurées')
        return true
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 'Erreur lors de la configuration',
      )
      return false
    }
  }

  const verifySecurityQuestions = async (
    answers: { questionId: string; answer: string }[],
  ) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_2FA}/security-questions/verify`,
        { answers },
        { withCredentials: true },
      )
      return data.success
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Réponses incorrectes')
      return false
    }
  }

  return {
    getAvailableQuestions,
    setSecurityQuestions,
    verifySecurityQuestions,
  }
}

export default useSecurityQuestions
