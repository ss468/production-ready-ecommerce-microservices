import React, { useState, useEffect } from 'react'
import { getOrders } from './api'

export default function Orders({ onBack }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    try {
      setLoading(true)
      console.log('Fetching orders from API...')
      const data = await getOrders()
      console.log('Orders fetched:', data)
      setOrders(Array.isArray(data) ? data : data.orders || [])
      setError(null)
    } catch (err) {
      console.error('Error loading orders:', err)
      setError(err.message)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Your Orders</h2>
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

      {loading && <p style={{ color: '#666' }}>Loading orders...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: 24,
          borderRadius: 4,
          textAlign: 'center'
        }}>
          <p style={{ color: '#666' }}>You haven't placed any orders yet</p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map((order) => (
            <div
              key={order._id}
              style={{
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: 4,
                padding: 16,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>
                    Order #{order._id?.slice(-8) || 'N/A'}
                  </h3>
                  <p style={{ margin: '4px 0', color: '#666', fontSize: 12 }}>
                    User: {order.user}
                  </p>
                </div>
                <div style={{
                  padding: '6px 12px',
                  backgroundColor: order.status === 'completed' ? '#d4edda' : '#fff3cd',
                  color: order.status === 'completed' ? '#155724' : '#856404',
                  borderRadius: 4,
                  fontWeight: 'bold',
                  fontSize: 12
                }}>
                  {order.status?.toUpperCase() || 'PENDING'}
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <strong>📦 Items:</strong>
                <ul style={{ margin: '8px 0', paddingLeft: 20, color: '#666', fontSize: 12 }}>
                  {order.products && order.products.length > 0 ? (
                    order.products.map((product, idx) => (
                      <li key={idx}>
                        {product.name || product.title || 'Product'} - ${product.price || 0}
                      </li>
                    ))
                  ) : (
                    <li>No items</li>
                  )}
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: 12 }}>
                <p style={{ margin: 0, color: '#666', fontSize: 12 }}>
                  📅 {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                </p>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#28a745' }}>
                  Total: ${order.totalPrice || 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
