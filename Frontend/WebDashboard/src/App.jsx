import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route } from "react-router-dom";
import Login from './Screens/Login/Login'
import UploadMantra from './Screens/UploadMantra/UploadMantra';
import Modal from 'react-modal';
function App() {
  const [count, setCount] = useState(0)

  Modal.setAppElement('#root'); // Replace '#root' with the appropriate element selector for your application's root element.

  return (
    <>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/login" element={<Login/>} />
        <Route path='/mantra' element={<UploadMantra/>}/>
      </Routes>
    </>
  )
}

export default App
