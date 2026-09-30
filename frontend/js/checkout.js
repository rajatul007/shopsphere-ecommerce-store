/**
 * ShopSphere - Checkout & Order Placement Manager
 */
import { api, showToast } from './api.js';
import { auth } from './auth.js';
import { formatPrice } from './main.js';

let currentCart = null;

export const loadCheckout = async () => {
  const container = document.getElementById('checkout-container');
  if (!container) return;

  if (!auth.requireAuth('/checkout.html')) return;

  container.innerHTML = `
    <div style="padding:4rem 0;text-align:center;">
      <div class="skeleton" style="height:350px;width:100%;border-radius:12px;"></div>
    </div>
  `;

  try {
    const data = await api.cart.get();
    currentCart = data.cart;

    if (!currentCart.items || currentCart.items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3 class="empty-title">Your shopping bag is empty</h3>
          <p class="empty-desc">Please add items to your cart before proceeding to checkout.</p>
          <a href="/products.html" class="btn btn-primary">Browse Catalog</a>
        </div>
      `;
      return;
    }

    const user = auth.getUser();
    const address = user?.address || {};

    container.innerHTML = `
      <div class="checkout-grid">
        <!-- Form Details -->
        <div>
          <form id="checkout-form">
            <!-- Customer Information -->
            <div class="checkout-card">
              <h2 class="checkout-card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                1. Customer Information
              </h2>

              <div class="form-group">
                <label class="form-label" for="full-name">Full Name *</label>
                <input type="text" id="full-name" class="form-control" value="${user?.name || ''}" required placeholder="e.g. Alex Morgan" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="email-address">Email Address *</label>
                  <input type="email" id="email-address" class="form-control" value="${user?.email || ''}" required placeholder="alex@example.com" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="phone-number">Phone Number *</label>
                  <input type="tel" id="phone-number" class="form-control" value="${user?.phone || ''}" required placeholder="+1 (555) 019-2834" />
                </div>
              </div>
            </div>

            <!-- Shipping Address -->
            <div class="checkout-card">
              <h2 class="checkout-card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                2. Shipping Address
              </h2>

              <div class="form-group">
                <label class="form-label" for="street-address">Street Address *</label>
                <input type="text" id="street-address" class="form-control" value="${address.address || ''}" required placeholder="123 Market Street, Apt 4B" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="city">City *</label>
                  <input type="text" id="city" class="form-control" value="${address.city || ''}" required placeholder="San Francisco" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="state">State / Province *</label>
                  <input type="text" id="state" class="form-control" value="${address.state || ''}" required placeholder="CA" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="postal-code">Postal / Zip Code *</label>
                  <input type="text" id="postal-code" class="form-control" value="${address.postalCode || ''}" required placeholder="94105" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="country">Country *</label>
                  <input type="text" id="country" class="form-control" value="${address.country || 'United States'}" required />
                </div>
              </div>

              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" for="order-notes">Delivery Instructions / Notes (Optional)</label>
                <textarea id="order-notes" class="form-control" rows="2" placeholder="e.g. Gate code #4012, please leave at front door"></textarea>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="checkout-card">
              <h2 class="checkout-card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                3. Payment Method
              </h2>

              <div class="payment-options">
                <label class="payment-option-label active" id="label-cod">
                  <input type="radio" name="paymentMethod" value="Cash on Delivery" checked style="accent-color:var(--accent-primary);" />
                  <div>
                    <strong style="display:block;font-size:0.925rem;">Cash on Delivery (COD)</strong>
                    <span style="font-size:0.8rem;color:var(--text-muted);">Pay in cash or debit card when your package is delivered to your doorstep.</span>
                  </div>
                </label>

                <label class="payment-option-label" id="label-card">
                  <input type="radio" name="paymentMethod" value="Card / Online Payment" style="accent-color:var(--accent-primary);" />
                  <div>
                    <strong style="display:block;font-size:0.925rem;">Online Payment (Credit / Debit Card)</strong>
                    <span style="font-size:0.8rem;color:var(--text-muted);">Instant simulated verification (Internship Project Mode - no actual charge applied).</span>
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" id="place-order-btn" class="btn btn-primary btn-block btn-lg" style="margin-top:1rem;">
              Complete & Place Order &rarr;
            </button>
          </form>
        </div>

        <!-- Order Summary Side Card -->
        <div>
          <div class="cart-summary-card" style="position:sticky;top:calc(var(--header-height) + 1.5rem);">
            <h3 class="summary-title">Order Summary (${currentCart.totalItems} items)</h3>

            <!-- Itemized mini preview -->
            <div style="max-height:260px;overflow-y:auto;margin-bottom:1.25rem;display:flex;flex-direction:column;gap:0.75rem;padding-right:0.5rem;">
              ${currentCart.items.map((item) => `
                <div style="display:flex;gap:0.75rem;align-items:center;">
                  <img src="${item.product.image}" alt="${item.product.name}" style="width:48px;height:48px;border-radius:6px;object-fit:cover;background:#f4f4f5;" />
                  <div style="flex:1;min-width:0;">
                    <div style="font-size:0.85rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.product.name}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);">${item.quantity} &times; ${formatPrice(item.product.effectivePrice)}</div>
                  </div>
                  <div class="tabular-nums" style="font-size:0.85rem;font-weight:700;">${formatPrice(item.subtotal)}</div>
                </div>
              `).join('')}
            </div>

            <div class="summary-row">
              <span>Subtotal</span>
              <span class="tabular-nums">${formatPrice(currentCart.subtotal)}</span>
            </div>

            <div class="summary-row">
              <span>Shipping Fee</span>
              <span class="tabular-nums">${currentCart.shippingCost === 0 ? '<strong style="color:var(--accent-success)">FREE</strong>' : formatPrice(currentCart.shippingCost)}</span>
            </div>

            <div class="summary-row">
              <span>Discount</span>
              <span class="tabular-nums">$0.00</span>
            </div>

            <div class="summary-total">
              <span>Total to Pay</span>
              <span class="tabular-nums">${formatPrice(currentCart.totalAmount)}</span>
            </div>

            <div style="margin-top:1.5rem;padding:1rem;background:var(--bg-subtle);border-radius:var(--radius-sm);font-size:0.8rem;color:var(--text-secondary);border:1px solid var(--border-light);">
              <div style="display:flex;align-items:center;gap:0.5rem;font-weight:600;color:var(--text-primary);margin-bottom:0.25rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                ShopSphere Buyer Protection
              </div>
              Orders are packaged with tamper-evident seals and guaranteed express handling.
            </div>
          </div>
        </div>
      </div>
    `;

    // Radio change handlers for visual active styling
    const radios = document.querySelectorAll('input[name="paymentMethod"]');
    radios.forEach((radio) => {
      radio.onchange = () => {
        document.querySelectorAll('.payment-option-label').forEach((lbl) => lbl.classList.remove('active'));
        radio.closest('.payment-option-label')?.classList.add('active');
      };
    });

    // Handle Form Submit
    const form = document.getElementById('checkout-form');
    const submitBtn = document.getElementById('place-order-btn');

    form.onsubmit = async (e) => {
      e.preventDefault();

      const fullName = document.getElementById('full-name').value.trim();
      const email = document.getElementById('email-address').value.trim();
      const phone = document.getElementById('phone-number').value.trim();
      const addressVal = document.getElementById('street-address').value.trim();
      const city = document.getElementById('city').value.trim();
      const state = document.getElementById('state').value.trim();
      const postalCode = document.getElementById('postal-code').value.trim();
      const country = document.getElementById('country').value.trim();
      const notes = document.getElementById('order-notes').value.trim();
      const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Cash on Delivery';

      if (!fullName || !phone || !addressVal || !city || !postalCode) {
        showToast('Please fill out all required shipping fields.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Processing Order...';

      try {
        const orderData = {
          items: currentCart.items.map((i) => ({
            product: i.product._id,
            name: i.product.name,
            quantity: i.quantity,
            price: i.product.effectivePrice,
            image: i.product.image,
          })),
          shippingAddress: {
            fullName,
            email,
            phone,
            address: addressVal,
            city,
            state,
            postalCode,
            country,
          },
          paymentMethod,
          notes,
        };

        const res = await api.orders.create(orderData);
        window.dispatchEvent(new CustomEvent('cart-updated'));
        showOrderConfirmation(res.order);
      } catch (error) {
        showToast(error.message || 'Failed to place order. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Complete & Place Order &rarr;';
      }
    };

  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <h3 class="empty-title">Error Loading Checkout</h3>
        <p class="empty-desc">${error.message}</p>
        <a href="/cart.html" class="btn btn-primary">Return to Bag</a>
      </div>
    `;
  }
};

// Render Order Confirmation View
export const showOrderConfirmation = (order) => {
  const container = document.getElementById('checkout-container');
  if (!container) return;

  const deliveryDate = new Date(order.estimatedDelivery || Date.now() + 4 * 24 * 60 * 60 * 1000);
  const formattedDelivery = deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  container.innerHTML = `
    <div style="max-width:680px;margin:2rem auto;background:#FFFFFF;border:1px solid var(--border-light);border-radius:var(--radius-md);padding:2.5rem 2rem;box-shadow:var(--shadow-md);">
      <div style="text-align:center;margin-bottom:2rem;">
        <div style="width:64px;height:64px;border-radius:50%;background:#DCFCE7;color:#166534;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <span style="font-size:0.8rem;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;color:var(--accent-success);">Order Placed Successfully</span>
        <h1 style="font-size:1.85rem;font-weight:800;color:var(--text-primary);letter-spacing:-0.02em;margin-top:0.25rem;">Thank You for Your Order!</h1>
        <p style="font-size:0.925rem;color:var(--text-muted);margin-top:0.35rem;">
          We have received your order and are preparing it for shipment.
        </p>
      </div>

      <!-- Order Details Banner -->
      <div style="background:var(--bg-subtle);border-radius:var(--radius-sm);padding:1.25rem;display:grid;grid-template-columns:repeat(2, 1fr);gap:1rem;margin-bottom:1.75rem;border:1px solid var(--border-light);">
        <div>
          <span style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;font-weight:600;display:block;">Order Reference</span>
          <strong class="font-mono-nums" style="font-size:1.05rem;color:var(--text-primary);">${order.trackingNumber || order._id}</strong>
        </div>
        <div>
          <span style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;font-weight:600;display:block;">Estimated Delivery</span>
          <strong style="font-size:0.95rem;color:var(--text-primary);">${formattedDelivery}</strong>
        </div>
        <div>
          <span style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;font-weight:600;display:block;">Payment Method</span>
          <strong style="font-size:0.95rem;color:var(--text-primary);">${order.paymentMethod}</strong>
        </div>
        <div>
          <span style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;font-weight:600;display:block;">Payment Status</span>
          <strong style="font-size:0.95rem;color:var(--accent-success);">&#10003; ${order.paymentStatus}</strong>
        </div>
      </div>

      <!-- Items Summary -->
      <div style="border-top:1px solid var(--border-light);border-bottom:1px solid var(--border-light);padding:1.25rem 0;margin-bottom:1.5rem;">
        <h4 style="font-size:0.9rem;font-weight:700;margin-bottom:1rem;text-transform:uppercase;letter-spacing:0.04em;">Items in this Order</h4>
        <div style="display:flex;flex-direction:column;gap:0.85rem;">
          ${order.items.map((item) => `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;">
              <div style="display:flex;align-items:center;gap:0.75rem;">
                <img src="${item.image}" alt="${item.name}" style="width:44px;height:44px;border-radius:6px;object-fit:cover;background:#f4f4f5;" />
                <div>
                  <div style="font-size:0.875rem;font-weight:600;">${item.name}</div>
                  <div style="font-size:0.775rem;color:var(--text-muted);">Qty: ${item.quantity} &times; ${formatPrice(item.price)}</div>
                </div>
              </div>
              <div class="tabular-nums" style="font-size:0.9rem;font-weight:700;">${formatPrice(item.price * item.quantity)}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Total Breakdown -->
      <div style="margin-bottom:2rem;display:flex;flex-direction:column;gap:0.5rem;font-size:0.9rem;">
        <div style="display:flex;justify-content:space-between;color:var(--text-secondary);">
          <span>Subtotal</span>
          <span class="tabular-nums">${formatPrice(order.subtotal)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;color:var(--text-secondary);">
          <span>Shipping Cost</span>
          <span class="tabular-nums">${order.shippingCost === 0 ? '<strong style="color:var(--accent-success)">FREE</strong>' : formatPrice(order.shippingCost)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:1.15rem;font-weight:800;color:var(--text-primary);padding-top:0.75rem;border-top:1px solid var(--border-light);">
          <span>Total Paid / Payable</span>
          <span class="tabular-nums">${formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      <!-- Shipping Address Details -->
      <div style="background:var(--bg-main);border-radius:var(--radius-sm);padding:1rem;margin-bottom:2rem;font-size:0.85rem;color:var(--text-secondary);border:1px solid var(--border-light);">
        <strong style="color:var(--text-primary);display:block;margin-bottom:0.25rem;">Deliver To:</strong>
        ${order.shippingAddress.fullName} &middot; ${order.shippingAddress.phone}<br/>
        ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}
      </div>

      <!-- Actions -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
        <a href="/orders.html" class="btn btn-secondary btn-block">
          View Order History
        </a>
        <a href="/products.html" class="btn btn-primary btn-block">
          Continue Shopping
        </a>
      </div>
    </div>
  `;
};

document.addEventListener('DOMContentLoaded', () => {
  loadCheckout();
});
