import { RefreshCwIcon } from 'lucide-react'
import { useState } from 'react'
import PrimaryButton from '../components/ui/PrimaryButton'
import ResendSection from '../components/ui/ResendAction'
import { useTheme } from '../context/Theme'
import SixDigitCodeInput from '../components/ui/SixDigitCodeInput'

export default function Home() {
  const { toggleTheme } = useTheme()
  const [code, setCode] = useState(Array(6).fill(''))
  return (
    <>
      <div className='bg-primary-500'>
        <h1>Welcome to the Home Page</h1>
        <p>This is the main landing page of the application.</p>
      </div>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <ResendSection
        onResend={() => {}}
        countdownSeconds={8}
        variant='block'
        align='center'
      />
      <PrimaryButton
        onClick={() => {}}
        icon={RefreshCwIcon}
        variant='danger'
        className='mt-4'
      >
        Click Me
      </PrimaryButton>
      <SixDigitCodeInput
        value={code}
        onChange={setCode}
        onComplete={() => console.log('Code complete:', code.join(''))}
      />
    </>
  )
}
