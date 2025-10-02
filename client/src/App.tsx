

import './App.css'

function App() {


  return (
    <div className='flex justify-center items-center min-h-250'>

      <div className='flex flex-col space-y-50 items-center'>
        <div className='text-8xl'>Travel the web.</div>
        <div className='flex flex-col space-y-10 items-center'>
          <button> <svg width="200px" height="200px" stroke-width="1.7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#ffffff"><path d="M12 4L12 20" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 9L8 15" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M20 10L20 14" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M4 10L4 14" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16 7L16 17" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>
          <div> click on the voice button above </div>
        </div>
      </div>

    </div>
  )
}

export default App
