import React, { useState } from 'react'

export default function Sign({ onLoginSuccess }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)
    setIsSubmitting(true)

    const url = mode === 'login' ? 'http://localhost:3003/auth/login' : 'http://localhost:3003/auth/register'

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: 'error', text: data.message || 'Request failed' })
        setIsSubmitting(false)
        return
      }

      if (mode === 'login') {
        localStorage.setItem('token', data.token)
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' })
        setTimeout(() => {
          onLoginSuccess()
        }, 1000)
      } else {
        setMessage({ type: 'success', text: 'Registration successful. Please login.' })
        setTimeout(() => {
          setMode('login')
          setEmail('')
          setPassword('')
          setIsSubmitting(false)
        }, 1500)
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
      setIsSubmitting(false)
    }
  }

  function handleModeToggle() {
    setMode(mode === 'login' ? 'register' : 'login')
    setMessage(null)
    setEmail('')
    setPassword('')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <p className="auth-badge">{mode === 'login' ? 'Welcome back' : 'Create account'}</p>
          <h2 className="auth-title">{mode === 'login' ? 'Sign in to ShopHub' : 'Register for ShopHub'}</h2>
          <p className="auth-subtitle">
            {mode === 'login' ? 'Access your orders and cart in one place.' : 'Join to start shopping in seconds.'}
          </p>
        </div>

        {message && (
          <div className={`auth-message ${message.type === 'error' ? 'is-error' : 'is-success'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label htmlFor="email" className="auth-label">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="auth-input"
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="password" className="auth-label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
              className="auth-input"
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="auth-submit-button">
            {isSubmitting ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Sign In' : 'Register')}
          </button>
        </form>

        <div className="auth-toggle">
          <span className="auth-toggle-text">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          </span>
          <button type="button" onClick={handleModeToggle} className="auth-toggle-button">
            {mode === 'login' ? 'Create one' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}
