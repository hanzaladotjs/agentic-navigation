
import { useState } from 'react'
import './App.css'

function App() {
 type buttonStates = "off" | "on" | "loading"
  
  const [buttonMode, setButtonMode] = useState<buttonStates>("off")
  let audioChunks: any = []
  let stream: any
  let audioBlobInMemory
  let mediaRecorder:any

  async function recordingTheVoice() {
    setButtonMode("on")
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    mediaRecorder = new MediaRecorder(stream)

    mediaRecorder.ondataavailable = (event:any) => {
      audioChunks.push(event.data)
    }

    mediaRecorder.onstop = () => {

      audioBlobInMemory = new Blob(audioChunks, { type: "audio/webm" })

      stream.getTracks().forEach((track: any) => track.stop())
    }

    mediaRecorder.start()
  }

  function stopRecording (){
    if(mediaRecorder && mediaRecorder.state === "recording"){
      mediaRecorder.stop()
    }
    setButtonMode("loading")
  }


  return (
    <div className='flex justify-center items-center min-h-250'>

      <div className='flex flex-col space-y-50 items-center'>
        <div className='text-8xl'>Travel the web.</div>
        <div className='flex flex-col space-y-10 items-center'>
          <button className={buttonMode=="loading"? 'border-[3px] border-gray-600 animate-pulse ' :'border-[3px] border-gray-600 ' }onClick={buttonMode=="off" ? recordingTheVoice : stopRecording}> {buttonMode=="off" ?<svg width="200px" height="200px" stroke-width="1.7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#ffffff"><path d="M12 4L12 20" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 9L8 15" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M20 10L20 14" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M4 10L4 14" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16 7L16 17" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path></svg> : buttonMode=='on' ? <svg width="200px" height="200px" stroke-width="1.7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#ff0000"><path d="M12 4L12 20" stroke="#ff0000" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 9L8 15" stroke="#ff0000" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M20 10L20 14" stroke="#ff0000" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M4 10L4 14" stroke="#ff0000" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16 7L16 17" stroke="#ff0000" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path></svg> : <svg width="200px" height="200px" stroke-width="1.7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#ffdbdb"><path d="M12 6L12 18" stroke="#ffdbdb" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9 9L9 15" stroke="#ffdbdb" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M18 11L18 13" stroke="#ffdbdb" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M6 11L6 13" stroke="#ffdbdb" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 7L15 17" stroke="#ffdbdb" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M6 3H3V6" stroke="#ffdbdb" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M18 3H21V6" stroke="#ffdbdb" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M6 21H3V18" stroke="#ffdbdb" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M18 21H21V18" stroke="#ffdbdb" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path></svg>}</button>
          <div> click on the voice button above </div>
        </div>
      </div>

    </div>
  )
}

export default App
