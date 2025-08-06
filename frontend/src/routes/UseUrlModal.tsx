import { useLocation, useNavigate } from 'react-router-dom'

export function useUrlModal(modalName: string) {
  const location = useLocation()
  const navigate = useNavigate()

  const searchParams = new URLSearchParams(location.search)
  const currentModal = searchParams.get('modal')

  const isOpen = currentModal === modalName

  const open = () => {
    searchParams.set('modal', modalName)
    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: true,
    })
  }

  const close = () => {
    searchParams.delete('modal')
    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: true,
    })
  }

  return { isOpen, open, close }
}
