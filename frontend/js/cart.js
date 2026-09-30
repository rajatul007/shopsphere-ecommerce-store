/**
 * ShopSphere - Shopping Cart Manager
 */
import { api, showToast } from './api.js';
import { auth } from './auth.js';
import { formatPrice } from './main.js';

export const loadCart = async () => {
  const container = document.getElementById('cart-container');
  if (!container) return;

  if (!auth.isLoggedIn()) {
    container.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <h3 class="empty-title">Your shopping bag is waiting</h3>
        <p class="empty-desc">Sign in to your account to review saved items, modify quantities, and complete checkout.</p>
        <div style="display:flex;gap:1rem;justify-content:center;">
          <a href="/login.html?redirect=/cart.html" class="btn btn-primary">Sign In</a>
          <a href="/products.html" class="btn btn-secondary">Explore Products</a>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="padding: 3rem 0; text-align: center;">
      <div class="skeleton" style="height: 250px; width: 100%; border-radius: 8px;"></div>
    </div>
  `;

  try {
    const data = await api.cart.get();
    const cart = data.cart;

    if (!cart.items || cart.items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <h3 class="empty-title">Your shopping bag is empty</h3>
          <p class="empty-desc">Explore our curated collections of electronics, apparel, and design essentials to add items.</p>
          <a href="/products.html" class="btn btn-primary">Start Shopping</a>
        </div>
      `;
      window.dispatchEvent(new CustomEvent('cart-updated'));
      return;
    }

    container.innerHTML = `
      <div class="cart-layout">
        <!-- Items Column -->
        <div>
          <div class="cart-table-wrap">
            <div style="padding:1rem 1.25rem;border-bottom:1px solid var(--border-light);display:flex;justify-content:space-between;align-items:center;background:var(--bg-subtle);">
              <span style="font-weight:700;font-size:0.875rem;text-transform:uppercase;letter-spacing:0.04em;">Items in Bag (${cart.totalItems})</span>
              <button id="clear-cart-btn" style="color:var(--accent-danger);font-size:0.825rem;font-weight:600;display:flex;align-items:center;gap:0.3rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Clear Bag
              </button>
            </div>

            ${cart.items.map((item) => `
              <div class="cart-item-row" data-product-id="${item.product._id}">
                <img 
                  src="${item.product.image}" 
                  alt="${item.product.name}" 
                  class="cart-item-img"
                  onerror="this.src='/src/assets/images/hero_shopsphere_banner_1790769913067.jpg'"
                />

                <div class="cart-item-details">
                  <span class="cart-item-cat">${item.product.category}</span>
                  <a href="/product.html?id=${item.product._id}" class="cart-item-title">${item.product.name}</a>
                  <div style="display:flex;align-items:center;gap:0.75rem;margin-top:0.35rem;">
                    <span class="cart-item-price tabular-nums">${formatPrice(item.product.effectivePrice)}</span>
                    ${item.product.stock <= 5 ? `<span style="font-size:0.75rem;color:var(--accent-warning);font-weight:500;">Only ${item.product.stock} left</span>` : ''}
                  </div>
                </div>

                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.75rem;">
                  <div class="quantity-stepper">
                    <button class="qty-btn btn-cart-dec" data-id="${item.product._id}" data-qty="${item.quantity - 1}">&minus;</button>
                    <span class="qty-input" style="display:flex;align-items:center;justify-content:center;">${item.quantity}</span>
                    <button class="qty-btn btn-cart-inc" data-id="${item.product._id}" data-qty="${item.quantity + 1}" ${item.quantity >= item.product.stock ? 'disabled style="opacity:0.4;"' : ''}>&plus;</button>
                  </div>
                  <div style="display:flex;align-items:center;gap:1rem;">
                    <span class="tabular-nums" style="font-weight:700;font-size:0.95rem;">${formatPrice(item.subtotal)}</span>
                    <button class="btn-cart-remove" data-id="${item.product._id}" style="color:var(--text-muted);padding:4px;" title="Remove Item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="margin-top:1.5rem;display:flex;justify-content:space-between;align-items:center;">
            <a href="/products.html" class="btn btn-secondary">
              &larr; Continue Shopping
            </a>
          </div>
        </div>

        <!-- Summary Column -->
        <div>
          <div class="cart-summary-card">
            <h3 class="summary-title">Order Summary</h3>

            <div class="summary-row">
              <span>Bag Subtotal</span>
              <span class="tabular-nums">${formatPrice(cart.subtotal)}</span>
            </div>

            <div class="summary-row">
              <span>Estimated Shipping</span>
              <span class="tabular-nums">${cart.shippingCost === 0 ? '<strong style="color:var(--accent-success)">FREE</strong>' : formatPrice(cart.shippingCost)}</span>
            </div>

            ${cart.subtotal < 100 ? `
              <div style="background:var(--bg-subtle);padding:0.75rem;border-radius:var(--radius-sm);font-size:0.8rem;color:var(--text-secondary);margin-bottom:1rem;border:1px solid var(--border-light);">
                Add <strong>${formatPrice(100 - cart.subtotal)}</strong> more to qualify for <strong>Free Express Shipping</strong>!
              </div>
            ` : `
              <div style="background:var(--bg-accent-soft);padding:0.75rem;border-radius:var(--radius-sm);font-size:0.8rem;color:var(--accent-success);margin-bottom:1rem;font-weight:600;">
                &#10003; Qualified for Complimentary Express Shipping!
              </div>
            `}

            <div class="summary-total">
              <span>Estimated Total</span>
              <span class="tabular-nums">${formatPrice(cart.totalAmount)}</span>
            </div>

            <a href="/checkout.html" class="btn btn-primary btn-block btn-lg" style="margin-top:1.5rem;">
              Proceed to Checkout &rarr;
            </a>

            <div style="margin-top:1.25rem;text-align:center;font-size:0.775rem;color:var(--text-muted);display:flex;flex-direction:column;gap:0.35rem;">
              <span>Taxes calculated at checkout</span>
              <span>Encrypted 256-bit checkout security</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Hook up button handlers
    attachCartHandlers();
    window.dispatchEvent(new CustomEvent('cart-updated'));

  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <h3 class="empty-title">Error Loading Cart</h3>
        <p class="empty-desc">${error.message}</p>
        <button onclick="window.loadCart()" class="btn btn-primary">Retry</button>
      </div>
    `;
  }
};

const attachCartHandlers = () => {
  // Clear cart
  const clearBtn = document.getElementById('clear-cart-btn');
  if (clearBtn) {
    clearBtn.onclick = async () => {
      if (confirm('Are you sure you want to remove all items from your shopping bag?')) {
        try {
          await api.cart.clear();
          showToast('Bag cleared.', 'info');
          loadCart();
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    };
  }

  // Increment buttons
  document.querySelectorAll('.btn-cart-inc').forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const qty = Number(btn.dataset.qty);
      try {
        await api.cart.updateItem(id, qty);
        loadCart();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  });

  // Decrement buttons
  document.querySelectorAll('.btn-cart-dec').forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const qty = Number(btn.dataset.qty);
      try {
        await api.cart.updateItem(id, qty);
        loadCart();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  });

  // Remove buttons
  document.querySelectorAll('.btn-cart-remove').forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      try {
        await api.cart.removeItem(id);
        showToast('Item removed from bag.', 'info');
        loadCart();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  });
};

window.loadCart = loadCart;

document.addEventListener('DOMContentLoaded', () => {
  loadCart();
});
