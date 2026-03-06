'use client'

import { useState, useRef, useCallback } from 'react'

interface VoiceInputProps {
  onTranscription: (text: string) => void
  className?: string
}

type RecordingState = 'idle' | 'recording' | 'processing'

export default function VoiceInput({ onTranscription, className = '' }: VoiceInputProps) {
  const [state, setState] = useState<RecordingState>('idle')
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      })

      chunksRef.current = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop())
        setState('processing')

        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        try {
          const formData = new FormData()
          formData.append('audio', audioBlob, 'recording.webm')

          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) throw new Error('Transcription failed')

          const { text } = await response.json()
          onTranscription(text)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Transcription failed')
        } finally {
          setState('idle')
        }
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setState('recording')
    } catch (err) {
      setError('Microphone access denied')
      setState('idle')
    }
  }, [onTranscription])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const handleClick = () => {
    if (state === 'idle') startRecording()
    else if (state === 'recording') stopRecording()
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        onClick={handleClick}
        disabled={state === 'processing'}
        className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ${
          state === 'recording'
            ? 'animate-pulse-ring bg-red-500 text-white'
            : state === 'processing'
              ? 'bg-surface-300 text-gray-500'
              : 'bg-surface-200 text-gray-300 hover:bg-surface-300 hover:text-white'
        }`}
        title={state === 'idle' ? 'Start recording' : state === 'recording' ? 'Stop recording' : 'Processing...'}
      >
        {state === 'processing' ? (
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : state === 'recording' ? (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        )}
        {state === 'recording' && (
          <span className="absolute -inset-1 animate-ping rounded-full bg-red-500/30" />
        )}
      </button>
      {state === 'recording' && (
        <p className="mt-2 text-xs text-red-400">Recording... tap to stop</p>
      )}
      {state === 'processing' && (
        <p className="mt-2 text-xs text-gray-500">Transcribing...</p>
      )}
      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}
