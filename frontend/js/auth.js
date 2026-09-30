/**
 * ShopSphere - Authentication State Manager
 */
import { api, setToken, removeToken, showToast } from './api.js';

let currentUser = null;

export const auth = {
  async init() {
    const token = localStorage.getItem('shopsphere_token');
    if (!token) {
      currentUser = null;
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: null }));
      return null;
    }

    try {
      const data = await api.auth.getMe();
      currentUser = data.user;
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: currentUser }));
      return currentUser;
    } catch (err) {
      removeToken();
      currentUser = null;
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: null }));
      return null;
    }
  },

  getUser() {
    return currentUser;
  },

  isLoggedIn() {
    return !!currentUser;
  },

  isAdmin() {
    return currentUser && currentUser.role === 'admin';
  },

  async login(email, password) {
    try {
      const data = await api.auth.login({ email, password });
      setToken(data.token);
      currentUser = data.user;
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: currentUser }));
      return data;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  },

  async register(userData) {
    try {
      const data = await api.auth.register(userData);
      setToken(data.token);
      currentUser = data.user;
      showToast(`Welcome to ShopSphere, ${data.user.name}!`, 'success');
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: currentUser }));
      return data;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  },

  logout() {
    removeToken();
    currentUser = null;
    showToast('You have been logged out.', 'info');
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: null }));
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 400);
  },

  requireAuth(redirectUrl = '/login.html') {
    if (!this.isLoggedIn()) {
      showToast('Please log in to continue.', 'error');
      setTimeout(() => {
        window.location.href = `${redirectUrl}?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      }, 500);
      return false;
    }
    return true;
  },

  requireAdmin(redirectUrl = '/') {
    if (!this.isAdmin()) {
      showToast('Access denied: Administrator privileges required.', 'error');
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 500);
      return false;
    }
    return true;
  }
};
