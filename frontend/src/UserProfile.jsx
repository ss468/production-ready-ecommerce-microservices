import React, { useState } from 'react'

export default function UserProfile({ user }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 14
        }}
      >
        👤 {user?.email?.split('@')[0] || 'Profile'}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 40,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            minWidth: 250,
            zIndex: 1000
          }}
          onClick={() => setIsOpen(false)}
        >
          <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <strong>📧 Email</strong>
              <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: 12 }}>
                {user?.email}
              </p>
            </div>

            <div style={{ marginBottom: 12 }}>
              <strong>🆔 User ID</strong>
              <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: 12, wordBreak: 'break-all' }}>
                {user?._id}
              </p>
            </div>

            <div style={{ marginBottom: 12 }}>
              <strong>📅 Member Since</strong>
              <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: 12 }}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div style={{
              borderTop: '1px solid #eee',
              paddingTop: 8,
              marginTop: 8,
              color: '#666',
              fontSize: 12
            }}>
              ✅ Authenticated
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
