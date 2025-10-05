import { useRef, useState } from 'react'
import './App.css'

function App() {
  type buttonStates = "off" | "on" | "loading"

  const [buttonMode, setButtonMode] = useState<buttonStates>("off")
  const audioChunks = useRef<any[]>([]) // Persist array across renders
  const stream = useRef<any>(null)
  const audioBlobInMemory = useRef<any>(null)
  const mediaRecorder = useRef<any>(null)
  const [theme, setTheme] = useState<boolean>(true)

  async function recordingTheVoice() {
    setButtonMode("on")
    stream.current = await navigator.mediaDevices.getUserMedia({ audio: true })

    mediaRecorder.current = new MediaRecorder(stream.current)

    mediaRecorder.current.ondataavailable = (event: any) => {
      audioChunks.current.push(event.data)
    }

    mediaRecorder.current.onstop = () => {
      audioBlobInMemory.current = new Blob(audioChunks.current, { type: "audio/webm" })
      audioChunks.current = []
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
    console.log("Converting WebM → WAV...")

    const wavBlob = await convertWebmToWav(audioBlob)
    console.log("Converted to WAV:", wavBlob)

    const formData = new FormData()
    formData.append('audio_file', wavBlob, 'command.wav')

    console.log("Uploading WAV to server...")

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

  // 🔊 Converts WebM → WAV using Web Audio API
  async function convertWebmToWav(webmBlob: Blob): Promise<Blob> {
    const arrayBuffer = await webmBlob.arrayBuffer()
    const audioCtx = new AudioContext()
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
    const wavBuffer = audioBufferToWav(audioBuffer)
    return new Blob([wavBuffer], { type: 'audio/wav' })
  }

  // 🎧 Converts AudioBuffer → WAV (16-bit PCM)
  function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const numOfChan = buffer.numberOfChannels
    const length = buffer.length * numOfChan * 2 + 44
    const outBuffer = new ArrayBuffer(length)
    const view = new DataView(outBuffer)
    const channels: Float32Array[] = []
    const sampleRate = buffer.sampleRate

    let offset = 0
    function writeString(s: string) {
      for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i))
      offset += s.length
    }

    // WAV Header
    writeString('RIFF')
    view.setUint32(offset, 36 + buffer.length * numOfChan * 2, true)
    offset += 4
    writeString('WAVE')
    writeString('fmt ')
    view.setUint32(offset, 16, true)
    offset += 4
    view.setUint16(offset, 1, true)
    offset += 2
    view.setUint16(offset, numOfChan, true)
    offset += 2
    view.setUint32(offset, sampleRate, true)
    offset += 4
    view.setUint32(offset, sampleRate * numOfChan * 2, true)
    offset += 4
    view.setUint16(offset, numOfChan * 2, true)
    offset += 2
    view.setUint16(offset, 16, true)
    offset += 2
    writeString('data')
    view.setUint32(offset, buffer.length * numOfChan * 2, true)
    offset += 4

    for (let i = 0; i < numOfChan; i++) channels.push(buffer.getChannelData(i))

    let sampleIndex = 0
    while (sampleIndex < buffer.length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][sampleIndex]))
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
        offset += 2
      }
      sampleIndex++
    }

    return outBuffer
  }

  return (
    <div className={`flex justify-center items-center min-h-screen  + ${!theme ?'bg-black text-white': null}`}>
      <div className='flex flex-col space-y-10 items-center mx-2'>
        <div className='text-8xl'>Travel the web.</div>
        <div className='flex flex-col space-y-10 items-center'>
          <button
            className={
              buttonMode == "loading"
                ? 'border-[3px] border-gray-600 bg-black animate-pulse '
                : 'border-[3px] bg-black border-gray-600 '
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
          <div> click on the voice button above, and wait patiently when its thinking. </div>
          <div className='flex space-x-20'>
          <div> made with love by <a href='https://hanzala.xyz' className='underline'> hadi</a></div>
          <button onClick={() => setTheme((prev) => !prev) }> {theme ? "light mode" : "dark mode"} </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
