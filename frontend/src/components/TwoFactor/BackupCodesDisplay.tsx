import React, { useState } from 'react'
import { Download, Copy, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import { toast } from 'sonner'

interface BackupCodesDisplayProps {
  codes: string[]
  onContinue: () => void
  onSkip: () => void
}

const BackupCodesDisplay: React.FC<BackupCodesDisplayProps> = ({
  codes,
  onContinue,
  onSkip,
}) => {
  const [showCodes, setShowCodes] = useState(true)

  const handleDownload = () => {
    const content = `Codes de secours - Le Préparationnaire
Générés le: ${new Date().toLocaleString()}

IMPORTANT: Stockez ces codes dans un endroit sûr.
Chaque code ne peut être utilisé qu'une seule fois.

${codes.join('\n')}

Ces codes vous permettront d'accéder à votre compte si vous perdez l'accès à vos autres méthodes de double authentification.`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup-codes-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Codes de secours téléchargés')
  }

  const handleCopyAll = () => {
    navigator.clipboard.writeText(codes.join('\n'))
    toast.success('Codes copiés dans le presse-papiers')
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copié')
  }

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20'>
          <AlertTriangle className='h-8 w-8 text-yellow-600 dark:text-yellow-400' />
        </div>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
          Codes de secours générés
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          Stockez ces codes dans un endroit sûr. Ils vous permettront d'accéder
          à votre compte si vous perdez l'accès à vos autres méthodes.
        </p>
      </div>

      <div className='bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-lg p-4'>
        <div className='flex items-center space-x-2 mb-3'>
          <AlertTriangle
            className='text-yellow-600 dark:text-yellow-400'
            size={16}
          />
          <span className='text-sm font-medium text-yellow-800 dark:text-yellow-600'>
            Important à retenir
          </span>
        </div>
        <ul className='text-sm text-yellow-800 dark:text-yellow-600 space-y-1'>
          <li>• Chaque code ne peut être utilisé qu'une seule fois</li>
          <li>• Stockez-les dans un endroit sûr et accessible</li>
          <li>• Ne les partagez avec personne</li>
          <li>• Vous pouvez les régénérer si nécessaire</li>
        </ul>
      </div>

      <div className='space-y-4'>
        <div className='flex flex-col items-center justify-between sm:flex-row gap-y-4'>
          <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
            Vos codes de secours
          </span>
          <div className='flex space-x-2'>
            <PrimaryButton
              variant='outline'
              size='sm'
              onClick={() => setShowCodes(!showCodes)}
              icon={showCodes ? EyeOff : Eye}
            >
              {showCodes ? 'Masquer' : 'Afficher'}
            </PrimaryButton>
            <PrimaryButton
              variant='outline'
              size='sm'
              onClick={handleCopyAll}
              icon={Copy}
            >
              Copier tout
            </PrimaryButton>
            <PrimaryButton
              variant='outline'
              size='sm'
              onClick={handleDownload}
              icon={Download}
            >
              Télécharger
            </PrimaryButton>
          </div>
        </div>

        {showCodes && (
          <div className='grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))] grid gap-2'>
            {codes.map(
              (code, index) => (
                console.log(codes),
                (
                  <div
                    key={index}
                    className='flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2'
                  >
                    <span className='font-mono text-sm text-gray-900 dark:text-gray-400'>
                      {code}
                    </span>
                    <button
                      onClick={() => handleCopyCode(code)}
                      className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1'
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                )
              ),
            )}
          </div>
        )}
      </div>

      <div className='flex space-x-3'>
        <PrimaryButton onClick={onContinue} fullWidth>
          Configurer les questions de sécurité
        </PrimaryButton>
        <PrimaryButton variant='outline' onClick={onSkip} fullWidth>
          Ignorer pour l'instant
        </PrimaryButton>
      </div>
    </div>
  )
}

export default BackupCodesDisplay
