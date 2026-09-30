/**
 * ShopSphere - Admin Dashboard Controller
 */
import { api, showToast } from './api.js';
import { auth } from './auth.js';
import { formatPrice } from './main.js';

let allProducts = [];
let allOrders = [];
let allUsers = [];
let editingProductId = null;

export const loadAdminDashboard = async () => {
  const container = document.getElementById('admin-container');
  if (!container) return;

  if (!auth.requireAdmin('/')) return;

  container.innerHTML = `
    <div style="padding:3rem 0;text-align:center;">
      <div class="skeleton" style="height:400px;width:100%;border-radius:12px;"></div>
    </div>
  `;

  try {
    const [statsRes, productsRes, ordersRes, usersRes] = await Promise.all([
      api.users.getAdminStats(),
      api.products.getAll({ limit: 100 }),
      api.orders.getAllOrders(),
      api.users.getAllUsers(),
    ]);

    const stats = statsRes.stats;
    allProducts = productsRes.products || [];
    allOrders = ordersRes.orders || [];
    allUsers = usersRes.users || [];

    container.innerHTML = `
      <!-- Stats 4-Card Grid -->
      <div class="admin-stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="6" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="18"/></svg>
          </div>
          <div>
            <div class="stat-value tabular-nums">${formatPrice(stats.totalSales)}</div>
            <div class="stat-label">Total Revenue</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          </div>
          <div>
            <div class="stat-value tabular-nums">${stats.totalOrders}</div>
            <div class="stat-label">Total Orders (${stats.pendingOrders} pending)</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          </div>
          <div>
            <div class="stat-value tabular-nums">${stats.totalProducts}</div>
            <div class="stat-label">Catalog Products (${stats.lowStockProducts} low stock)</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <div class="stat-value tabular-nums">${stats.totalUsers}</div>
            <div class="stat-label">Registered Accounts</div>
          </div>
        </div>
      </div>

      <!-- Admin Tab Navigation -->
      <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-light);margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
        <div style="display:flex;gap:0.5rem;" id="admin-tabs">
          <button class="btn btn-secondary btn-sm active" data-tab="tab-products" style="font-weight:700;">Products (${allProducts.length})</button>
          <button class="btn btn-outline btn-sm" data-tab="tab-orders">Orders (${allOrders.length})</button>
          <button class="btn btn-outline btn-sm" data-tab="tab-users">Users (${allUsers.length})</button>
        </div>

        <button id="btn-open-create-product" class="btn btn-primary btn-sm">
          &plus; Add New Product
        </button>
      </div>

      <!-- Tab 1: Products Table -->
      <div id="tab-products" class="admin-tab-pane">
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th style="text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${allProducts.map((p) => `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:0.75rem;">
                      <img src="${p.image}" alt="${p.name}" style="width:40px;height:40px;border-radius:4px;object-fit:cover;background:#f4f4f5;" />
                      <div>
                        <strong style="display:block;font-size:0.9rem;color:var(--text-primary);">${p.name}</strong>
                        <span style="font-size:0.75rem;color:var(--text-muted);">${p.brand || 'ShopSphere'}</span>
                      </div>
                    </div>
                  </td>
                  <td><span style="font-size:0.85rem;color:var(--text-secondary);">${p.category}</span></td>
                  <td>
                    <span class="tabular-nums" style="font-weight:700;">${formatPrice(p.discountPrice || p.price)}</span>
                    ${p.discountPrice ? `<span style="font-size:0.75rem;color:var(--text-muted);text-decoration:line-through;margin-left:0.25rem;">${formatPrice(p.price)}</span>` : ''}
                  </td>
                  <td>
                    <span class="tabular-nums ${p.stock <= 5 ? 'stock-low' : 'stock-in'}" style="font-weight:600;">
                      ${p.stock} units
                    </span>
                  </td>
                  <td><span style="font-size:0.85rem;">${p.rating.toFixed(1)} &star; (${p.numReviews})</span></td>
                  <td style="text-align:right;">
                    <div style="display:inline-flex;gap:0.4rem;">
                      <button class="btn btn-secondary btn-sm btn-edit-prod" data-id="${p._id}">Edit</button>
                      <button class="btn btn-danger btn-sm btn-del-prod" data-id="${p._id}">Delete</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 2: Orders Table -->
      <div id="tab-orders" class="admin-tab-pane" style="display:none;">
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th style="text-align:right;">Update Status</th>
              </tr>
            </thead>
            <tbody>
              ${allOrders.map((o) => `
                <tr>
                  <td>
                    <strong class="font-mono-nums">${o.trackingNumber || o._id.substring(0, 8)}</strong>
                    <span style="display:block;font-size:0.75rem;color:var(--text-muted);">${new Date(o.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td>
                    <div style="font-size:0.85rem;font-weight:600;">${o.shippingAddress?.fullName || o.user?.name || 'Customer'}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);">${o.shippingAddress?.city}, ${o.shippingAddress?.country || 'USA'}</div>
                  </td>
                  <td><span style="font-size:0.85rem;">${o.items.length} items (${o.items.reduce((s, i) => s + i.quantity, 0)} qty)</span></td>
                  <td><strong class="tabular-nums">${formatPrice(o.totalAmount)}</strong></td>
                  <td>
                    <span style="font-size:0.8rem;display:block;">${o.paymentMethod}</span>
                    <span style="font-size:0.75rem;color:${o.paymentStatus === 'Paid' ? 'var(--accent-success)' : 'var(--text-muted)'};font-weight:600;">${o.paymentStatus}</span>
                  </td>
                  <td>
                    <span class="status-badge ${o.orderStatus === 'Delivered' ? 'status-delivered' : o.orderStatus === 'Shipped' ? 'status-shipped' : 'status-confirmed'}">
                      ${o.orderStatus}
                    </span>
                  </td>
                  <td style="text-align:right;">
                    <select class="select-control order-status-select" data-id="${o._id}" style="padding:0.35rem 0.5rem;font-size:0.8rem;">
                      <option value="Pending" ${o.orderStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                      <option value="Confirmed" ${o.orderStatus === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                      <option value="Processing" ${o.orderStatus === 'Processing' ? 'selected' : ''}>Processing</option>
                      <option value="Shipped" ${o.orderStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
                      <option value="Delivered" ${o.orderStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                      <option value="Cancelled" ${o.orderStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 3: Users Table -->
      <div id="tab-users" class="admin-tab-pane" style="display:none;">
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Shipping Location</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              ${allUsers.map((u) => `
                <tr>
                  <td><strong>${u.name}</strong></td>
                  <td><span style="color:var(--text-secondary);font-size:0.85rem;">${u.email}</span></td>
                  <td>
                    <span class="status-badge ${u.role === 'admin' ? 'status-confirmed' : 'status-pending'}">
                      ${u.role}
                    </span>
                  </td>
                  <td><span style="font-size:0.85rem;">${u.phone || 'N/A'}</span></td>
                  <td><span style="font-size:0.85rem;">${u.address?.city || ''}${u.address?.city && u.address?.state ? ', ' : ''}${u.address?.state || ''}</span></td>
                  <td><span style="font-size:0.8rem;color:var(--text-muted);">${new Date(u.createdAt).toLocaleDateString()}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Product Modal (Add / Edit) -->
      <div id="product-modal" class="modal-overlay">
        <div class="modal-box">
          <div class="modal-header">
            <h3 id="modal-title" class="modal-title">Add New Product</h3>
            <button id="modal-close" style="font-size:1.5rem;line-height:1;color:var(--text-muted);">&times;</button>
          </div>
          <form id="product-form">
            <div class="form-group">
              <label class="form-label" for="prod-name">Product Name *</label>
              <input type="text" id="prod-name" class="form-control" required placeholder="e.g. Minimalist Ceramic Vessel" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="prod-category">Category *</label>
                <select id="prod-category" class="form-control" required>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Home & Living">Home & Living</option>
                  <option value="Beauty">Beauty</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="prod-brand">Brand</label>
                <input type="text" id="prod-brand" class="form-control" placeholder="ShopSphere Atelier" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="prod-price">Regular Price ($) *</label>
                <input type="number" step="0.01" min="0" id="prod-price" class="form-control" required placeholder="129.00" />
              </div>
              <div class="form-group">
                <label class="form-label" for="prod-discount">Discount Price ($)</label>
                <input type="number" step="0.01" min="0" id="prod-discount" class="form-control" placeholder="0 or sale price" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="prod-stock">Stock Quantity *</label>
                <input type="number" min="0" id="prod-stock" class="form-control" required value="15" />
              </div>
              <div class="form-group">
                <label class="form-label" for="prod-image">Image URL *</label>
                <input type="text" id="prod-image" class="form-control" required value="/src/assets/images/hero_shopsphere_banner_1790769913067.jpg" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="prod-desc">Description *</label>
              <textarea id="prod-desc" class="form-control" rows="3" required placeholder="Detailed specifications and material descriptions..."></textarea>
            </div>

            <div style="display:flex;justify-content:flex-end;gap:0.75rem;margin-top:1.5rem;">
              <button type="button" id="modal-cancel-btn" class="btn btn-secondary">Cancel</button>
              <button type="submit" id="modal-submit-btn" class="btn btn-primary">Save Product</button>
            </div>
          </form>
        </div>
      </div>
    `;

    attachAdminHandlers();

  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <h3 class="empty-title">Error Loading Admin Portal</h3>
        <p class="empty-desc">${error.message}</p>
        <button onclick="window.loadAdminDashboard()" class="btn btn-primary">Retry</button>
      </div>
    `;
  }
};

const attachAdminHandlers = () => {
  // Tab Switching
  const tabButtons = document.querySelectorAll('#admin-tabs button');
  const panes = document.querySelectorAll('.admin-tab-pane');

  tabButtons.forEach((btn) => {
    btn.onclick = () => {
      tabButtons.forEach((b) => {
        b.classList.remove('active', 'btn-secondary');
        b.classList.add('btn-outline');
      });
      btn.classList.add('active', 'btn-secondary');
      btn.classList.remove('btn-outline');

      const targetId = btn.dataset.tab;
      panes.forEach((p) => {
        p.style.display = p.id === targetId ? 'block' : 'none';
      });
    };
  });

  // Modal elements
  const modal = document.getElementById('product-modal');
  const modalClose = document.getElementById('modal-close');
  const modalCancel = document.getElementById('modal-cancel-btn');
  const openCreateBtn = document.getElementById('btn-open-create-product');
  const productForm = document.getElementById('product-form');
  const modalTitle = document.getElementById('modal-title');

  const openModal = (isEdit = false, product = null) => {
    editingProductId = isEdit && product ? product._id : null;
    modalTitle.textContent = isEdit ? 'Edit Product' : 'Add New Product';

    if (isEdit && product) {
      document.getElementById('prod-name').value = product.name;
      document.getElementById('prod-category').value = product.category;
      document.getElementById('prod-brand').value = product.brand || '';
      document.getElementById('prod-price').value = product.price;
      document.getElementById('prod-discount').value = product.discountPrice || 0;
      document.getElementById('prod-stock').value = product.stock;
      document.getElementById('prod-image').value = product.image;
      document.getElementById('prod-desc').value = product.description;
    } else {
      productForm.reset();
      document.getElementById('prod-image').value = '/src/assets/images/hero_shopsphere_banner_1790769913067.jpg';
    }
    modal.classList.add('active');
  };

  const closeModal = () => {
    modal.classList.remove('active');
    editingProductId = null;
  };

  if (openCreateBtn) openCreateBtn.onclick = () => openModal(false);
  if (modalClose) modalClose.onclick = closeModal;
  if (modalCancel) modalCancel.onclick = closeModal;

  // Edit Product buttons
  document.querySelectorAll('.btn-edit-prod').forEach((btn) => {
    btn.onclick = () => {
      const prod = allProducts.find((p) => p._id === btn.dataset.id);
      if (prod) openModal(true, prod);
    };
  });

  // Delete Product buttons
  document.querySelectorAll('.btn-del-prod').forEach((btn) => {
    btn.onclick = async () => {
      if (confirm('Are you sure you want to permanently delete this product?')) {
        try {
          await api.products.delete(btn.dataset.id);
          showToast('Product deleted.', 'info');
          loadAdminDashboard();
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    };
  });

  // Order Status dropdowns
  document.querySelectorAll('.order-status-select').forEach((select) => {
    select.onchange = async (e) => {
      const orderId = select.dataset.id;
      const newStatus = e.target.value;
      try {
        await api.orders.updateStatus(orderId, { orderStatus: newStatus });
        showToast(`Order status updated to "${newStatus}"`, 'success');
        loadAdminDashboard();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  });

  // Handle Product Form Submit
  if (productForm) {
    productForm.onsubmit = async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('modal-submit-btn');
      submitBtn.disabled = true;

      const productPayload = {
        name: document.getElementById('prod-name').value.trim(),
        category: document.getElementById('prod-category').value,
        brand: document.getElementById('prod-brand').value.trim(),
        price: parseFloat(document.getElementById('prod-price').value),
        discountPrice: parseFloat(document.getElementById('prod-discount').value) || 0,
        stock: parseInt(document.getElementById('prod-stock').value, 10),
        image: document.getElementById('prod-image').value.trim(),
        description: document.getElementById('prod-desc').value.trim(),
      };

      try {
        if (editingProductId) {
          await api.products.update(editingProductId, productPayload);
          showToast('Product updated successfully!', 'success');
        } else {
          await api.products.create(productPayload);
          showToast('Product created successfully!', 'success');
        }
        closeModal();
        loadAdminDashboard();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        submitBtn.disabled = false;
      }
    };
  }
};

window.loadAdminDashboard = loadAdminDashboard;

document.addEventListener('DOMContentLoaded', () => {
  loadAdminDashboard();
});
