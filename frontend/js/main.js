/**
 * ShopSphere - Main Site Shell, Navbar & Footer Manager
 */
import { auth } from './auth.js';
import { api, showToast } from './api.js';

export const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
};

export const renderStars = (rating) => {
  const rounded = Math.round(rating * 2) / 2;
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) {
      starsHtml += '<svg class="star-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
    } else {
      starsHtml += '<svg class="star-icon" style="color:#D1D5DB" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
    }
  }
  return starsHtml;
};

// Global Cart Badge Counter
export const updateCartBadge = async () => {
  const badgeEl = document.getElementById('cart-count-badge');
  if (!badgeEl) return;

  if (!auth.isLoggedIn()) {
    // Check local guest cart if any
    const guestCart = JSON.parse(localStorage.getItem('shopsphere_guest_cart') || '[]');
    const count = guestCart.reduce((sum, item) => sum + item.quantity, 0);
    badgeEl.textContent = count;
    badgeEl.style.display = count > 0 ? 'flex' : 'none';
    return;
  }

  try {
    const data = await api.cart.get();
    const count = data.cart.totalItems || 0;
    badgeEl.textContent = count;
    badgeEl.style.display = count > 0 ? 'flex' : 'none';
  } catch (err) {
    // If not logged in or error, hide
    badgeEl.style.display = 'none';
  }
};

// Render Unified Header
export const renderHeader = () => {
  const headerContainer = document.getElementById('site-header');
  if (!headerContainer) return;

  const currentPath = window.location.pathname;
  const user = auth.getUser();
  const isAdmin = auth.isAdmin();

  headerContainer.innerHTML = `
    <div class="top-notice">
      <span>Curated Minimalist Collections &middot; Complimentary express shipping on orders over $100</span>
    </div>
    <header class="header">
      <div class="container nav-container">
        <!-- Zone 1: Brand Wordmark -->
        <a href="/" class="brand-link">
          <span class="brand-icon-mark">S</span>
          <span>ShopSphere</span>
        </a>

        <!-- Zone 2: Navigation Links -->
        <nav class="nav-links">
          <a href="/" class="nav-link ${currentPath === '/' || currentPath.endsWith('index.html') ? 'active' : ''}">Home</a>
          <a href="/products.html" class="nav-link ${currentPath.includes('products') ? 'active' : ''}">Products</a>
          <a href="/products.html?category=Electronics" class="nav-link">Electronics</a>
          <a href="/products.html?category=Fashion" class="nav-link">Fashion</a>
          <a href="/products.html?category=Home%20%26%20Living" class="nav-link">Home & Living</a>
          ${isAdmin ? `<a href="/admin.html" class="nav-link ${currentPath.includes('admin') ? 'active' : ''}" style="color:var(--accent-highlight);font-weight:600;">Admin Dashboard</a>` : ''}
        </nav>

        <!-- Zone 3: Actions -->
        <div class="nav-actions">
          <a href="/products.html" class="nav-action-btn" title="Search Catalog">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span class="hidden md:inline" style="font-size:0.85rem;">Catalog</span>
          </a>

          <a href="/cart.html" class="nav-action-btn cart-btn-wrapper" title="View Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            <span id="cart-count-badge" class="cart-badge" style="display:none;">0</span>
          </a>

          ${user ? `
            <div style="display:flex;align-items:center;gap:0.5rem;">
              <a href="/profile.html" class="nav-action-btn" title="My Account">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span style="font-size:0.85rem;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${user.name.split(' ')[0]}</span>
              </a>
              <button id="logout-btn" class="btn btn-outline btn-sm" title="Log Out" style="padding:0.35rem 0.65rem;">
                Logout
              </button>
            </div>
          ` : `
            <a href="/login.html" class="btn btn-secondary btn-sm">Login</a>
            <a href="/register.html" class="btn btn-primary btn-sm hidden sm:inline-flex">Register</a>
          `}

          <button id="mobile-toggle" class="mobile-menu-toggle" aria-label="Open Navigation Menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Drawer -->
    <div id="mobile-menu-drawer" style="display:none;position:fixed;top:var(--header-height);left:0;right:0;background:#FFFFFF;border-bottom:1px solid var(--border-light);padding:1.5rem;box-shadow:var(--shadow-md);z-index:99;">
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <a href="/" class="nav-link">Home</a>
        <a href="/products.html" class="nav-link">All Products</a>
        <a href="/products.html?category=Electronics" class="nav-link">Electronics</a>
        <a href="/products.html?category=Fashion" class="nav-link">Fashion</a>
        <a href="/products.html?category=Shoes" class="nav-link">Shoes</a>
        <a href="/products.html?category=Accessories" class="nav-link">Accessories</a>
        <a href="/products.html?category=Home%20%26%20Living" class="nav-link">Home & Living</a>
        <a href="/products.html?category=Beauty" class="nav-link">Beauty</a>
        <hr style="border:none;border-top:1px solid var(--border-light);" />
        ${user ? `
          <a href="/profile.html" class="nav-link">My Profile & Shipping</a>
          <a href="/orders.html" class="nav-link">My Order History</a>
          ${isAdmin ? `<a href="/admin.html" class="nav-link" style="color:var(--accent-highlight);font-weight:600;">Admin Dashboard</a>` : ''}
          <button id="mobile-logout-btn" class="btn btn-outline btn-block" style="margin-top:0.5rem;">Logout</button>
        ` : `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
            <a href="/login.html" class="btn btn-secondary btn-block">Login</a>
            <a href="/register.html" class="btn btn-primary btn-block">Register</a>
          </div>
        `}
      </div>
    </div>
  `;

  // Attach event listeners
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.onclick = () => auth.logout();

  const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
  if (mobileLogoutBtn) mobileLogoutBtn.onclick = () => auth.logout();

  const mobileToggle = document.getElementById('mobile-toggle');
  const drawer = document.getElementById('mobile-menu-drawer');
  if (mobileToggle && drawer) {
    mobileToggle.onclick = () => {
      drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
    };
  }

  updateCartBadge();
};

// Render Unified Footer
export const renderFooter = () => {
  const footerContainer = document.getElementById('site-footer');
  if (!footerContainer) return;

  footerContainer.innerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <a href="/" class="brand-link" style="margin-bottom:1rem;display:inline-flex;">
              <span class="brand-icon-mark">S</span>
              <span>ShopSphere</span>
            </a>
            <p style="font-size:0.9rem;color:var(--text-secondary);max-width:320px;line-height:1.6;margin-bottom:1.25rem;">
              A full-stack modern e-commerce storefront dedicated to precision, craftsmanship, and timeless everyday essentials.
            </p>
            <div style="display:flex;gap:0.75rem;color:var(--text-muted);">
              <span>&copy; 2026 ShopSphere. All rights reserved.</span>
            </div>
          </div>

          <div>
            <h4 class="footer-col-title">Collections</h4>
            <ul class="footer-links">
              <li><a href="/products.html?category=Electronics">Electronics & Audio</a></li>
              <li><a href="/products.html?category=Fashion">Apparel & Textiles</a></li>
              <li><a href="/products.html?category=Shoes">Footwear & Boots</a></li>
              <li><a href="/products.html?category=Accessories">Leather & Accessories</a></li>
              <li><a href="/products.html?category=Home%20%26%20Living">Home & Living</a></li>
              <li><a href="/products.html?category=Beauty">Clean Skincare & Beauty</a></li>
            </ul>
          </div>

          <div>
            <h4 class="footer-col-title">Customer Care</h4>
            <ul class="footer-links">
              <li><a href="/cart.html">Shopping Bag</a></li>
              <li><a href="/orders.html">Order Tracking</a></li>
              <li><a href="/profile.html">Account Settings</a></li>
              <li><a href="/products.html">Product Catalog</a></li>
              <li><a href="#shipping">Shipping & Returns</a></li>
            </ul>
          </div>

          <div>
            <h4 class="footer-col-title">Account & Security</h4>
            <ul class="footer-links">
              <li><a href="/login.html">Sign In</a></li>
              <li><a href="/register.html">Create Account</a></li>
              <li><a href="/admin.html">Merchant Portal</a></li>
              <li><span style="color:var(--text-muted);font-size:0.8rem;">256-bit SSL Encrypted</span></li>
              <li><span style="color:var(--text-muted);font-size:0.8rem;">Cash on Delivery Available</span></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p>Built with Node.js, Express, MongoDB, and Vanilla JavaScript.</p>
          <div style="display:flex;gap:1.5rem;">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>System Status</span>
          </div>
        </div>
      </div>
    </footer>
  `;
};

// Global App Initialization
document.addEventListener('DOMContentLoaded', async () => {
  await auth.init();
  renderHeader();
  renderFooter();

  window.addEventListener('auth-changed', () => {
    renderHeader();
  });

  window.addEventListener('cart-updated', () => {
    updateCartBadge();
  });
});
