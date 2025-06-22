import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface VoiceSearchProps {
  onResult: (transcript: string) => void
  isListening: boolean
  setIsListening: (isListening: boolean) => void
}

// Define types for the Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export function VoiceSearch({ onResult, isListening, setIsListening }: VoiceSearchProps) {
  const [recognition, setRecognition] = useState<any>(null)

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = true
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('')
        
        onResult(transcript)
      }
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        toast.error('Voice input error. Please try again.')
        setIsListening(false)
      }
      
      recognition.onend = () => {
        setIsListening(false)
      }
      
      setRecognition(recognition)
    }
  }, [onResult, setIsListening])

  const toggleListening = () => {
    if (!recognition) {
      toast.error('Speech recognition is not supported in your browser')
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }

  if (!recognition) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleListening}
      className={`relative h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center ${
        isListening ? 'bg-red-50 border-red-200' : ''
      }`}
    >
      {isListening ? (
        <>
          <MicOff className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </>
      ) : (
        <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
      )}
      
      {/* Touch-friendly tap area for mobile */}
      <span className="absolute inset-0 sm:hidden" />
    </Button>
  )
} 