import React, { useState } from 'react'
import { checkHealth, checkOrderServiceHealth, getOrders } from './api'

export default function Diagnostics({ onClose }) {
  const [results, setResults] = useState({})
  const [testing, setTesting] = useState(false)

  async function runDiagnostics() {
    setTesting(true)
    const newResults = {}

    try {
      console.log('=== Starting Diagnostics ===')
      
      // Test 1: API Gateway Health
      try {
        console.log('Test 1: API Gateway health...')
        const healthResult = await checkHealth()
        newResults.gateway = { status: 'OK', data: healthResult }
        console.log('✓ API Gateway is healthy:', healthResult)
      } catch (err) {
        newResults.gateway = { status: 'ERROR', error: err.message }
        console.error('✗ API Gateway health check failed:', err)
      }

      // Test 2: Order Service Health (through gateway)
      try {
        console.log('Test 2: Order service health...')
        const orderHealthResult = await checkOrderServiceHealth()
        newResults.orderService = { status: 'OK', data: orderHealthResult }
        console.log('✓ Order service is healthy:', orderHealthResult)
      } catch (err) {
        newResults.orderService = { status: 'ERROR', error: err.message }
        console.error('✗ Order service health check failed:', err)
      }

      // Test 3: Get Orders (requires auth)
      try {
        console.log('Test 3: Fetching orders...')
        const token = localStorage.getItem('token')
        if (!token) {
          newResults.orders = { status: 'SKIP', error: 'No token found' }
        } else {
          const ordersResult = await getOrders()
          newResults.orders = { status: 'OK', count: ordersResult.length, data: ordersResult }
          console.log(`✓ Found ${ordersResult.length} orders`)
        }
      } catch (err) {
        newResults.orders = { status: 'ERROR', error: err.message }
        console.error('✗ Orders fetch failed:', err)
      }

      setResults(newResults)
      console.log('=== Diagnostics Complete ===')
      console.log('Results:', newResults)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 24,
        maxWidth: 600,
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>API Diagnostics</h2>
          <button
            onClick={onClose}
            style={{
              padding: '4px 8px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>

        <button
          onClick={runDiagnostics}
          disabled={testing}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: testing ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: testing ? 'not-allowed' : 'pointer',
            marginBottom: 16,
            fontWeight: 'bold'
          }}
        >
          {testing ? '⏳ Running Tests...' : '▶ Run Diagnostics'}
        </button>

        {Object.keys(results).length > 0 && (
          <div>
            <h3>Results:</h3>
            
            {results.gateway && (
              <div style={{
                padding: 12,
                marginBottom: 12,
                backgroundColor: results.gateway.status === 'OK' ? '#efe' : '#fee',
                border: `1px solid ${results.gateway.status === 'OK' ? '#cfc' : '#fcc'}`,
                borderRadius: 4
              }}>
                <strong>🌐 API Gateway: {results.gateway.status}</strong>
                {results.gateway.error && <p style={{ margin: '8px 0 0 0', color: '#a00' }}>{results.gateway.error}</p>}
                {results.gateway.data && <pre style={{ margin: '8px 0 0 0', fontSize: '11px' }}>{JSON.stringify(results.gateway.data, null, 2)}</pre>}
              </div>
            )}

            {results.orderService && (
              <div style={{
                padding: 12,
                marginBottom: 12,
                backgroundColor: results.orderService.status === 'OK' ? '#efe' : '#fee',
                border: `1px solid ${results.orderService.status === 'OK' ? '#cfc' : '#fcc'}`,
                borderRadius: 4
              }}>
                <strong>📦 Order Service: {results.orderService.status}</strong>
                {results.orderService.error && <p style={{ margin: '8px 0 0 0', color: '#a00' }}>{results.orderService.error}</p>}
                {results.orderService.data && <pre style={{ margin: '8px 0 0 0', fontSize: '11px' }}>{JSON.stringify(results.orderService.data, null, 2)}</pre>}
              </div>
            )}

            {results.orders && (
              <div style={{
                padding: 12,
                marginBottom: 12,
                backgroundColor: results.orders.status === 'OK' ? '#efe' : (results.orders.status === 'SKIP' ? '#fff3cd' : '#fee'),
                border: `1px solid ${results.orders.status === 'OK' ? '#cfc' : (results.orders.status === 'SKIP' ? '#ffc107' : '#fcc')}`,
                borderRadius: 4
              }}>
                <strong>📋 Get Orders: {results.orders.status}</strong>
                {results.orders.error && <p style={{ margin: '8px 0 0 0', color: '#a00' }}>{results.orders.error}</p>}
                {results.orders.count !== undefined && <p style={{ margin: '8px 0 0 0' }}>Found {results.orders.count} orders</p>}
                {results.orders.data && results.orders.data.length > 0 && (
                  <pre style={{ margin: '8px 0 0 0', fontSize: '11px' }}>{JSON.stringify(results.orders.data.slice(0, 2), null, 2)}</pre>
                )}
              </div>
            )}

            <p style={{ fontSize: 12, color: '#666', marginTop: 16 }}>
              💡 Check the browser console (F12) for detailed logs
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
