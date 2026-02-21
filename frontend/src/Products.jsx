import React, { useState, useEffect } from 'react'
import { getProducts, getCart, saveCart } from './api'

const productStyles = {
  container: {
    padding: '32px 0'
  },
  header: {
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0
  },
  backBtn: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  cardHover: {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 30px rgba(102, 126, 234, 0.2)'
  },
  cardImage: {
    width: '100%',
    height: '200px',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '60px',
    fontWeight: 'bold'
  },
  cardContent: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  productName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 8px 0',
    lineHeight: '1.3'
  },
  productDescription: {
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.5',
    marginBottom: '12px',
    flex: 1,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
  },
  priceStock: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e0e0e0'
  },
  price: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#667eea',
    margin: 0
  },
  stock: {
    fontSize: '12px',
    color: '#888',
    backgroundColor: '#f5f6fa',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: '600'
  },
  addBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  addBtnHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
  }
}

export default function Products({ onBack, onNavigateToCart }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cardHovers, setCardHovers] = useState({})
  const [btnHovers, setBtnHovers] = useState({})

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      setLoading(true)
      const data = await getProducts()
      setProducts(Array.isArray(data) ? data : data.products || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function addToCart(product) {
    try {
      const cart = await getCart()
      const existingItemIndex = cart.items.findIndex(item => item._id === product._id)
      
      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += 1
      } else {
        cart.items.push({
          _id: product._id,
          name: product.name || product.title,
          price: product.price,
          quantity: 1
        })
      }
      
      cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      await saveCart(cart)
      alert(`${product.name || product.title} added to cart! ✓`)
      onNavigateToCart()
    } catch (err) {
      alert('Error adding to cart: ' + err.message)
    }
  }

  const getProductEmoji = (name) => {
    const emojiMap = {
      'laptop': '💻',
      'phone': '📱',
      'iphone': '📱',
      'headphone': '🎧',
      'watch': '⌚',
      'tablet': '📱',
      'camera': '📷',
      'speaker': '🔊',
      'monitor': '🖥️',
      'keyboard': '⌨️',
      'mouse': '🖱️',
      'charger': '🔌'
    }
    const lowerName = name.toLowerCase()
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (lowerName.includes(key)) return emoji
    }
    return '📦'
  }

  return (
    <div style={productStyles.container}>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .product-card {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>

      <div style={productStyles.header}>
        <h2 style={productStyles.title}>🛍️ Browse Products</h2>
        <button
          onClick={onBack}
          onMouseEnter={() => setBtnHovers({...btnHovers, back: true})}
          onMouseLeave={() => setBtnHovers({...btnHovers, back: false})}
          style={{
            ...productStyles.backBtn,
            ...(btnHovers.back ? {transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'} : {})
          }}
        >
          ← Back
        </button>
      </div>

      {loading && (
        <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
          <p style={{fontSize: '16px'}}>🔄 Loading products...</p>
        </div>
      )}
      
      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#d32f2f',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #ffcdd2'
        }}>
          ❌ Error: {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div style={{
          backgroundColor: '#f5f6fa',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <p style={{color: '#666', fontSize: '16px'}}>😕 No products available yet</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div style={productStyles.grid}>
          {products.map((product) => (
            <div
              key={product._id}
              className="product-card"
              onMouseEnter={() => setCardHovers({...cardHovers, [product._id]: true})}
              onMouseLeave={() => setCardHovers({...cardHovers, [product._id]: false})}
              style={{
                ...productStyles.card,
                ...(cardHovers[product._id] ? productStyles.cardHover : {})
              }}
            >
              <div style={productStyles.cardImage}>
                {getProductEmoji(product.name)}
              </div>
              
              <div style={productStyles.cardContent}>
                <h3 style={productStyles.productName}>
                  {product.name || product.title || 'Product'}
                </h3>
                
                <p style={productStyles.productDescription}>
                  {product.description || 'No description available'}
                </p>
                
                <div style={productStyles.priceStock}>
                  <p style={productStyles.price}>
                    ${(product.price || 0).toFixed(2)}
                  </p>
                  <span style={productStyles.stock}>
                    Stock: {product.stock || 0}
                  </span>
                </div>
                
                <button
                  onMouseEnter={() => setBtnHovers({...btnHovers, [`add-${product._id}`]: true})}
                  onMouseLeave={() => setBtnHovers({...btnHovers, [`add-${product._id}`]: false})}
                  onClick={() => addToCart(product)}
                  style={{
                    ...productStyles.addBtn,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    ...(btnHovers[`add-${product._id}`] ? productStyles.addBtnHover : {})
                  }}
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
