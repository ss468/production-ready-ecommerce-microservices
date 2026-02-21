import React, { useState, useEffect } from 'react'
import Sign from './Sign'
import Home from './Home'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user has a token in localStorage
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  function handleLoginSuccess() {
    setIsLoggedIn(true)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
  }

  return (
    <div>
      {isLoggedIn ? (
        <Home onLogout={handleLogout} />
      ) : (
        <Sign onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  )
}
