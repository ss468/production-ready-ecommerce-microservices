import React, { useState, useEffect } from 'react'
import { getCart, saveCart, createOrder } from './api'

export default function Cart({ onBack }) {
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ordering, setOrdering] = useState(false)
  const [orderMessage, setOrderMessage] = useState(null)

  useEffect(() => {
    loadCart()
  }, [])

  async function loadCart() {
    try {
      setLoading(true)
      const data = await getCart()
      setCart(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function removeItem(index) {
    const newItems = cart.items.filter((_, i) => i !== index)
    const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const newCart = { items: newItems, total: newTotal }
    await saveCart(newCart)
    setCart(newCart)
  }

  async function updateQuantity(index, newQuantity) {
    if (newQuantity <= 0) {
      removeItem(index)
      return
    }
    
    const newItems = [...cart.items]
    newItems[index].quantity = newQuantity
    const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const newCart = { items: newItems, total: newTotal }
    await saveCart(newCart)
    setCart(newCart)
  }

  async function handleCheckout() {
    if (cart.items.length === 0) {
      alert('Cart is empty!')
      return
    }

    try {
      setOrdering(true)
      setOrderMessage(null)
      
      // Create order with product IDs
      const productIds = cart.items.map(item => item._id)
      const result = await createOrder(productIds)
      
      const orderId = result._id || result.orderId || 'Order Placed'
      setOrderMessage({ 
        type: 'success', 
        text: `Order placed successfully! Order ID: ${orderId}` 
      })
      
      console.log('Order created:', result)
      
      // Clear cart after successful order
      setTimeout(() => {
        saveCart({ items: [], total: 0 })
        setCart({ items: [], total: 0 })
      }, 2000)
    } catch (err) {
      console.error('Checkout error:', err)
      setOrderMessage({ 
        type: 'error', 
        text: `Error placing order: ${err.message}` 
      })
    } finally {
      setOrdering(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Shopping Cart</h2>
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
      </div>

      {orderMessage && (
        <div style={{
          padding: 12,
          marginBottom: 16,
          backgroundColor: orderMessage.type === 'error' ? '#fee' : '#efe',
          color: orderMessage.type === 'error' ? '#a00' : '#070',
          borderRadius: 4,
          border: `1px solid ${orderMessage.type === 'error' ? '#fcc' : '#cfc'}`
        }}>
          {orderMessage.text}
        </div>
      )}

      {loading && <p style={{ color: '#666' }}>Loading cart...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && !error && cart.items.length === 0 && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: 24,
          borderRadius: 4,
          textAlign: 'center'
        }}>
          <p style={{ color: '#666', marginBottom: 16 }}>Your cart is empty</p>
          <p style={{ color: '#999', fontSize: 12 }}>Browse products to add items</p>
        </div>
      )}

      {!loading && !error && cart.items.length > 0 && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {cart.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  padding: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>
                    {item.name || 'Product'}
                  </h3>
                  <p style={{ margin: '4px 0', color: '#666', fontSize: 12 }}>
                    Price: ${item.price || 0}
                  </p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => updateQuantity(idx, item.quantity - 1)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #ddd',
                        borderRadius: 4,
                        cursor: 'pointer'
                      }}
                    >
                      −
                    </button>
                    <span style={{ minWidth: 30, textAlign: 'center', fontWeight: 'bold' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(idx, item.quantity + 1)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #ddd',
                        borderRadius: 4,
                        cursor: 'pointer'
                      }}
                    >
                      +
                    </button>
                  </div>
                  
                  <div style={{
                    minWidth: 80,
                    textAlign: 'right',
                    fontWeight: 'bold',
                    color: '#28a745'
                  }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>

                <button
                  onClick={() => removeItem(idx)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 12
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div style={{
            backgroundColor: '#f8f9fa',
            padding: 16,
            borderRadius: 4,
            marginBottom: 16
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 12,
              fontSize: 16
            }}>
              <strong>Subtotal:</strong>
              <span>${cart.total.toFixed(2)}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 12,
              color: '#666',
              fontSize: 12
            }}>
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '1px solid #ddd',
              paddingTop: 12,
              fontSize: 18,
              fontWeight: 'bold'
            }}>
              <span>Total:</span>
              <span style={{ color: '#28a745' }}>${cart.total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={ordering}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: ordering ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: ordering ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: 16
            }}
          >
            {ordering ? '⏳ Processing Order...' : '✓ Proceed to Checkout'}
          </button>
        </div>
      )}
    </div>
  )
}
