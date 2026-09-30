/**
 * ShopSphere - API Communication Client & Toast System
 */

const API_BASE = '/api';

// Token Management
export const getToken = () => localStorage.getItem('shopsphere_token');
export const setToken = (token) => localStorage.setItem('shopsphere_token', token);
export const removeToken = () => localStorage.removeItem('shopsphere_token');

// Toast Notification Manager
export const showToast = (message, type = 'info', duration = 3500) => {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button style="color:currentColor;opacity:0.8;font-size:1.1rem;line-height:1;" aria-label="Dismiss">&times;</button>
  `;

  const dismissBtn = toast.querySelector('button');
  dismissBtn.onclick = () => toast.remove();

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.2s ease';
    setTimeout(() => toast.remove(), 200);
  }, duration);
};

// Generic Fetch Request Helper
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

// API Service Endpoints
export const api = {
  // Auth
  auth: {
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    getMe: () => request('/auth/me'),
  },

  // Products
  products: {
    getAll: (params = {}) => {
      const searchParams = new URLSearchParams();
      if (params.keyword) searchParams.append('keyword', params.keyword);
      if (params.category && params.category !== 'All') searchParams.append('category', params.category);
      if (params.minPrice) searchParams.append('minPrice', params.minPrice);
      if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice);
      if (params.sort) searchParams.append('sort', params.sort);
      if (params.featured) searchParams.append('featured', 'true');
      if (params.limit) searchParams.append('limit', params.limit);
      
      const qs = searchParams.toString();
      return request(`/products${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/products/${id}`),
    create: (productData) => request('/products', { method: 'POST', body: JSON.stringify(productData) }),
    update: (id, productData) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) }),
    delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  },

  // Cart
  cart: {
    get: () => request('/cart'),
    add: (productId, quantity = 1) => request('/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
    updateItem: (productId, quantity) => request(`/cart/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
    removeItem: (productId) => request(`/cart/${productId}`, { method: 'DELETE' }),
    clear: () => request('/cart', { method: 'DELETE' }),
  },

  // Orders
  orders: {
    create: (orderData) => request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
    getMyOrders: () => request('/orders'),
    getById: (id) => request(`/orders/${id}`),
    getAllOrders: () => request('/orders/admin/all'),
    updateStatus: (id, statusData) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(statusData) }),
  },

  // Users
  users: {
    getProfile: () => request('/users/profile'),
    updateProfile: (userData) => request('/users/profile', { method: 'PUT', body: JSON.stringify(userData) }),
    getAllUsers: () => request('/users'),
    getAdminStats: () => request('/users/admin/stats'),
  },
};
