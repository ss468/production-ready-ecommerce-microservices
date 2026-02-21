import React, { useState, useEffect } from 'react'
import UserProfile from './UserProfile'
import Products from './Products'
import Orders from './Orders'
import Cart from './Cart'
import Diagnostics from './Diagnostics'
import { getUserProfile } from './api'

export default function Home({ onLogout }) {
  const [currentView, setCurrentView] = useState('products')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDiagnostics, setShowDiagnostics] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  async function fetchUserProfile() {
    try {
      const userData = await getUserProfile()
      setUser(userData)
    } catch (err) {
      console.error('Failed to fetch user profile:', err.message)
    } finally {
      setLoading(false)
    }
  }

  function renderView() {
    switch (currentView) {
      case 'products':
        return <Products onBack={() => setCurrentView('products')} onNavigateToCart={() => setCurrentView('cart')} />
      case 'orders':
        return <Orders onBack={() => setCurrentView('products')} />
      case 'cart':
        return <Cart onBack={() => setCurrentView('products')} />
      default:
        return <Products onBack={() => setCurrentView('products')} onNavigateToCart={() => setCurrentView('cart')} />
    }
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-brand-wrap">
          <h1 className="home-brand">ShopHub</h1>
          <p className="home-tagline">Smart shopping dashboard</p>
        </div>

        <div className="home-actions">
          <button
            onClick={() => setCurrentView('products')}
            className={`home-nav-btn ${currentView === 'products' ? 'is-active' : ''}`}
          >
            Products
          </button>

          <button
            onClick={() => setCurrentView('cart')}
            className={`home-nav-btn ${currentView === 'cart' ? 'is-active' : ''}`}
          >
            Cart
          </button>

          <button
            onClick={() => setCurrentView('orders')}
            className={`home-nav-btn ${currentView === 'orders' ? 'is-active' : ''}`}
          >
            Orders
          </button>

          <div className="home-divider" aria-hidden="true" />

          {!loading && user && (
            <div className="home-profile-wrap">
              <UserProfile user={user} />
            </div>
          )}

          <button onClick={onLogout} className="home-nav-btn home-logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="home-content">
        {renderView()}
      </main>

      {showDiagnostics && (
        <Diagnostics onClose={() => setShowDiagnostics(false)} />
      )}
    </div>
  )
}
