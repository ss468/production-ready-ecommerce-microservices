const API_BASE = 'http://localhost:3003';

export async function checkHealth() {
  console.log('Checking API Gateway health...');
  const res = await fetch(`${API_BASE}/health`);
  const data = await res.json();
  console.log('API Gateway health:', data);
  return data;
}

export async function checkOrderServiceHealth() {
  console.log('Checking Order service health...');
  const res = await fetch(`${API_BASE}/orders/health`);
  const data = await res.json();
  console.log('Order service health:', data);
  return data;
}

export async function getUserProfile() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    }
  });
  
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function getProducts() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/products/api/products`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    }
  });
  
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function getOrders() {
  const token = localStorage.getItem('token');
  console.log('Calling GET /orders with token:', token ? 'present' : 'missing');
  
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    }
  });
  
  console.log('GET /orders response status:', res.status);
  
  if (!res.ok) {
    const errorData = await res.text();
    console.error('GET /orders error response:', errorData);
    throw new Error(`Failed to fetch orders: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function createOrder(productIds) {
  const token = localStorage.getItem('token');
  console.log('Creating order with product IDs:', productIds);
  
  const res = await fetch(`${API_BASE}/products/api/products/buy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    },
    body: JSON.stringify({ ids: productIds })
  });
  
  console.log('Order creation response status:', res.status);
  
  if (!res.ok) {
    const errorData = await res.text();
    console.error('Order creation error:', errorData);
    throw new Error(`Failed to create order: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();
  console.log('Order created successfully:', data);
  return data;
}

export async function getCart() {
  // Get cart from localStorage
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : { items: [], total: 0 };
}

export async function saveCart(cart) {
  // Save cart to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  return cart;
}
