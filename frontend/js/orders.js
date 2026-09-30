/**
 * ShopSphere - User Orders Page Logic
 */
import { api, showToast } from './api.js';
import { auth } from './auth.js';
import { formatPrice } from './main.js';

export const loadOrders = async () => {
  const container = document.getElementById('orders-container');
  if (!container) return;

  if (!auth.requireAuth('/orders.html')) return;

  container.innerHTML = `
    <div style="padding:3rem 0;text-align:center;">
      <div class="skeleton" style="height:300px;width:100%;border-radius:10px;"></div>
    </div>
  `;

  try {
    const data = await api.orders.getMyOrders();
    const orders = data.orders || [];

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <h3 class="empty-title">No orders found yet</h3>
          <p class="empty-desc">You haven't placed any orders yet. Discover our collection of artisan essentials today.</p>
          <a href="/products.html" class="btn btn-primary">Start Shopping</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:1.5rem;">
        ${orders.map((order) => {
          const date = new Date(order.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const deliveryDate = new Date(order.estimatedDelivery || Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });

          let statusClass = 'status-pending';
          if (order.orderStatus === 'Delivered') statusClass = 'status-delivered';
          else if (order.orderStatus === 'Shipped') statusClass = 'status-shipped';
          else if (order.orderStatus === 'Processing' || order.orderStatus === 'Confirmed') statusClass = 'status-confirmed';
          else if (order.orderStatus === 'Cancelled') statusClass = 'status-cancelled';

          return `
            <div class="checkout-card" style="margin-bottom:0;">
              <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-light);padding-bottom:1rem;margin-bottom:1rem;gap:0.75rem;">
                <div>
                  <span style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;font-weight:600;display:block;">Order Placed</span>
                  <span style="font-size:0.9rem;font-weight:600;color:var(--text-primary);">${date}</span>
                </div>
                <div>
                  <span style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;font-weight:600;display:block;">Order Reference</span>
                  <span class="font-mono-nums" style="font-size:0.9rem;font-weight:700;color:var(--text-primary);">${order.trackingNumber || order._id}</span>
                </div>
                <div>
                  <span style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;font-weight:600;display:block;">Total Amount</span>
                  <span class="tabular-nums" style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">${formatPrice(order.totalAmount)}</span>
                </div>
                <div>
                  <span class="status-badge ${statusClass}">${order.orderStatus}</span>
                </div>
              </div>

              <!-- Item List -->
              <div style="display:flex;flex-direction:column;gap:1rem;margin-bottom:1.25rem;">
                ${order.items.map((item) => `
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;">
                    <div style="display:flex;align-items:center;gap:1rem;">
                      <img src="${item.image}" alt="${item.name}" style="width:52px;height:52px;border-radius:6px;object-fit:cover;background:#f4f4f5;" />
                      <div>
                        <h4 style="font-size:0.925rem;font-weight:600;color:var(--text-primary);">${item.name}</h4>
                        <span style="font-size:0.8rem;color:var(--text-muted);">Quantity: ${item.quantity} &middot; Unit Price: ${formatPrice(item.price)}</span>
                      </div>
                    </div>
                    <span class="tabular-nums" style="font-size:0.925rem;font-weight:700;">${formatPrice(item.price * item.quantity)}</span>
                  </div>
                `).join('')}
              </div>

              <!-- Footer details -->
              <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;background:var(--bg-subtle);border-radius:var(--radius-sm);padding:0.85rem 1rem;font-size:0.825rem;gap:0.75rem;">
                <div style="color:var(--text-secondary);">
                  <strong>Delivery to:</strong> ${order.shippingAddress.fullName} &middot; Est. by <strong>${deliveryDate}</strong>
                </div>
                <div style="color:var(--text-muted);">
                  Payment: <strong>${order.paymentMethod}</strong> (${order.paymentStatus})
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <h3 class="empty-title">Error Loading Orders</h3>
        <p class="empty-desc">${error.message}</p>
        <button onclick="window.loadOrders()" class="btn btn-primary">Try Again</button>
      </div>
    `;
  }
};

window.loadOrders = loadOrders;

document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
});
