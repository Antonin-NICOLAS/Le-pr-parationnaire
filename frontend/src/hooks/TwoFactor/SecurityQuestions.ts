import axios from 'axios'
import { toast } from 'sonner'
import type {
  SecurityQuestion,
  UserSecurityQuestion,
} from '../../types/twoFactor'
import { VITE_2FA_QUESTIONS } from '../../utils/env'

const useSecurityQuestions = () => {
  const getAvailableQuestions = async (): Promise<SecurityQuestion[]> => {
    try {
      const { data } = await axios.get(`${VITE_2FA_QUESTIONS}/available`, {
        withCredentials: true,
      })
      return data.questions || []
    } catch (error) {
      toast.error('Erreur lors du chargement des questions')
      return []
    }
  }

  const setSecurityQuestions = async (questions: UserSecurityQuestion[]) => {
    try {
      const { data } = await axios.post(
        `${VITE_2FA_QUESTIONS}/set`,
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
        `${VITE_2FA_QUESTIONS}/verify`,
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
