import { useRef, useState } from 'react'
import './App.css'

function App() {
  type buttonStates = "off" | "on" | "loading"

  const [buttonMode, setButtonMode] = useState<buttonStates>("off")
  const audioChunks = useRef<any[]>([]) // Persist array across renders
  const stream = useRef<any>(null)
  const audioBlobInMemory = useRef<any>(null)
  const mediaRecorder = useRef<any>(null)

  async function recordingTheVoice() {
    setButtonMode("on")
    stream.current = await navigator.mediaDevices.getUserMedia({ audio: true })

    mediaRecorder.current = new MediaRecorder(stream.current)

    mediaRecorder.current.ondataavailable = (event: any) => {
      audioChunks.current.push(event.data)
    }

    mediaRecorder.current.onstop = () => {
      audioBlobInMemory.current = new Blob(audioChunks.current, { type: "audio/webm" })
      audioChunks.current = [] // reset for next recording
      stream.current.getTracks().forEach((track: any) => track.stop())
    }

    mediaRecorder.current.start()
  }

  function stopRecording() {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop()
    }

    setButtonMode("loading")

    setTimeout(() => {
      if (audioBlobInMemory.current) {
        processAudio(audioBlobInMemory.current)
        audioBlobInMemory.current = null
        console.log("In-memory Blob cleared.")
      }
    }, 500)
  }

  async function processAudio(audioBlob: any) {
    const formData = new FormData()
    formData.append('audio_file', audioBlob, 'command.webm')

    console.log("Uploading audio to server...")

    const response = await fetch('http://localhost:3000/audio', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Server error ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    return { message: data.message }
  }

  return (
    <div className='flex justify-center items-center min-h-250'>
      <div className='flex flex-col space-y-50 items-center'>
        <div className='text-8xl'>Travel the web.</div>
        <div className='flex flex-col space-y-10 items-center'>
          <button
            className={
              buttonMode == "loading"
                ? 'border-[3px] border-gray-600 animate-pulse '
                : 'border-[3px] border-gray-600 '
            }
            onClick={buttonMode == "off" ? recordingTheVoice : stopRecording}
          >
            {buttonMode == "off" ? (
              <svg width="200px" height="200px" strokeWidth="1.7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#ffffff">
                <path d="M12 4L12 20" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M8 9L8 15" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M20 10L20 14" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M4 10L4 14" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M16 7L16 17" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            ) : buttonMode == "on" ? (
              <svg width="200px" height="200px" strokeWidth="1.7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#ff0000">
                <path d="M12 4L12 20" stroke="#ff0000" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M8 9L8 15" stroke="#ff0000" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M20 10L20 14" stroke="#ff0000" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M4 10L4 14" stroke="#ff0000" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M16 7L16 17" stroke="#ff0000" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            ) : (
              <svg width="200px" height="200px" strokeWidth="1.7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#ffdbdb">
                <path d="M12 6L12 18" stroke="#ffdbdb" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M9 9L9 15" stroke="#ffdbdb" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M18 11L18 13" stroke="#ffdbdb" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M6 11L6 13" stroke="#ffdbdb" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M15 7L15 17" stroke="#ffdbdb" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M6 3H3V6" stroke="#ffdbdb" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M18 3H21V6" stroke="#ffdbdb" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M6 21H3V18" stroke="#ffdbdb" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M18 21H21V18" stroke="#ffdbdb" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            )}
          </button>
          <div> click on the voice button above </div>
        </div>
      </div>
    </div>
  )
}

export default App
