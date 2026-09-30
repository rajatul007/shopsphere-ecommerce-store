/**
 * ShopSphere - Product Details Page Logic
 */
import { api, showToast } from './api.js';
import { auth } from './auth.js';
import { formatPrice, renderStars } from './main.js';
import { renderProductCard } from './products.js';

let currentProduct = null;
let selectedQuantity = 1;

export const loadProductDetail = async () => {
  const container = document.getElementById('pdp-content');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    container.innerHTML = `
      <div class="empty-state">
        <h3 class="empty-title">Product Not Specified</h3>
        <p class="empty-desc">Please choose a valid product from our collection catalog.</p>
        <a href="/products.html" class="btn btn-primary">Browse Catalog</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display:flex;justify-content:center;padding:4rem 0;">
      <div class="skeleton" style="width:100%;height:450px;border-radius:12px;"></div>
    </div>
  `;

  try {
    const data = await api.products.getById(productId);
    currentProduct = data.product;
    const relatedProducts = data.relatedProducts || [];

    const effectivePrice = currentProduct.discountPrice && currentProduct.discountPrice > 0 
      ? currentProduct.discountPrice 
      : currentProduct.price;
    const hasDiscount = currentProduct.discountPrice && currentProduct.discountPrice > 0 && currentProduct.discountPrice < currentProduct.price;

    let stockLabel = `${currentProduct.stock} in stock`;
    let stockClass = 'stock-in';
    if (currentProduct.stock === 0) {
      stockClass = 'stock-out';
      stockLabel = 'Out of Stock';
    } else if (currentProduct.stock <= 5) {
      stockClass = 'stock-low';
      stockLabel = `Only ${currentProduct.stock} left in stock - order soon`;
    }

    // Set page title
    document.title = `${currentProduct.name} - ShopSphere`;

    container.innerHTML = `
      <div class="pdp-breadcrumbs">
        <a href="/">Home</a>
        <span>/</span>
        <a href="/products.html">Products</a>
        <span>/</span>
        <a href="/products.html?category=${encodeURIComponent(currentProduct.category)}">${currentProduct.category}</a>
        <span>/</span>
        <span style="color:var(--text-primary);font-weight:500;">${currentProduct.name}</span>
      </div>

      <div class="pdp-grid">
        <!-- Gallery -->
        <div class="pdp-gallery">
          <img 
            src="${currentProduct.image}" 
            alt="${currentProduct.name}" 
            class="pdp-main-img" 
            onerror="this.src='/src/assets/images/hero_shopsphere_banner_1790769913067.jpg'"
          />
        </div>

        <!-- Purchase Module -->
        <div class="pdp-info">
          <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem;">
            <span style="font-size:0.8rem;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;color:var(--text-muted);">
              ${currentProduct.brand || 'ShopSphere Collection'}
            </span>
            <span aria-hidden="true" style="color:var(--border-light);">&middot;</span>
            <span style="font-size:0.8rem;color:var(--text-muted);font-weight:600;">
              ${currentProduct.category}
            </span>
          </div>

          <h1 class="pdp-title">${currentProduct.name}</h1>

          <div class="pdp-rating-row">
            ${renderStars(currentProduct.rating)}
            <span style="font-weight:700;font-size:0.95rem;">${currentProduct.rating.toFixed(1)}</span>
            <span style="color:var(--text-muted);font-size:0.85rem;">(${currentProduct.numReviews} customer reviews)</span>
            <span style="color:var(--border-light);">&middot;</span>
            <span class="stock-indicator ${stockClass}" style="font-weight:600;font-size:0.85rem;">${stockLabel}</span>
          </div>

          <div class="pdp-price-box">
            <span class="pdp-price tabular-nums">${formatPrice(effectivePrice)}</span>
            ${hasDiscount ? `<span class="pdp-old-price tabular-nums">${formatPrice(currentProduct.price)}</span>` : ''}
            ${hasDiscount ? `<span style="background:var(--accent-primary);color:#fff;font-size:0.75rem;font-weight:700;padding:2px 8px;border-radius:4px;">Save ${formatPrice(currentProduct.price - currentProduct.discountPrice)}</span>` : ''}
          </div>

          <p class="pdp-description">${currentProduct.description}</p>

          ${currentProduct.stock > 0 ? `
            <div class="pdp-quantity-row">
              <span style="font-size:0.9rem;font-weight:600;color:var(--text-primary);">Quantity</span>
              <div class="quantity-stepper">
                <button id="qty-minus" class="qty-btn" aria-label="Decrease quantity">&minus;</button>
                <input id="qty-val" class="qty-input" type="text" value="1" readonly />
                <button id="qty-plus" class="qty-btn" aria-label="Increase quantity">&plus;</button>
              </div>
              <span style="font-size:0.825rem;color:var(--text-muted);">${currentProduct.stock} available</span>
            </div>

            <div class="pdp-cta-group">
              <button id="btn-add-bag" class="btn btn-secondary btn-lg" style="border-color:var(--border-dark);">
                Add to Bag
              </button>
              <button id="btn-buy-now" class="btn btn-primary btn-lg">
                Buy Now
              </button>
            </div>
          ` : `
            <div style="background:#FEE2E2;border:1px solid #FCA5A5;border-radius:var(--radius-sm);padding:1rem;color:#991B1B;margin-bottom:2rem;font-weight:500;">
              This item is currently sold out. Please check back later.
            </div>
          `}

          <!-- Trust Badges -->
          <div style="background:var(--bg-subtle);border-radius:var(--radius-sm);padding:1.25rem;display:flex;flex-direction:column;gap:0.75rem;border:1px solid var(--border-light);">
            <div style="display:flex;align-items:center;gap:0.75rem;font-size:0.85rem;color:var(--text-secondary);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              <span>Complimentary insured shipping on orders over $100</span>
            </div>
            <div style="display:flex;align-items:center;gap:0.75rem;font-size:0.85rem;color:var(--text-secondary);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>30-day hassle-free return and exchange policy</span>
            </div>
            <div style="display:flex;align-items:center;gap:0.75rem;font-size:0.85rem;color:var(--text-secondary);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              <span>Cash on Delivery (COD) or Card Payment available</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      ${relatedProducts.length > 0 ? `
        <div style="margin-top:4rem;border-top:1px solid var(--border-light);padding-top:3rem;">
          <h2 class="section-title" style="margin-bottom:1.5rem;">Complementary Recommendations</h2>
          <div class="products-grid">
            ${relatedProducts.map(renderProductCard).join('')}
          </div>
        </div>
      ` : ''}
    `;

    // Quantity Stepper handlers
    const qtyMinus = document.getElementById('qty-minus');
    const qtyPlus = document.getElementById('qty-plus');
    const qtyVal = document.getElementById('qty-val');
    const btnAddBag = document.getElementById('btn-add-bag');
    const btnBuyNow = document.getElementById('btn-buy-now');

    if (qtyMinus && qtyPlus && qtyVal) {
      qtyMinus.onclick = () => {
        if (selectedQuantity > 1) {
          selectedQuantity--;
          qtyVal.value = selectedQuantity;
        }
      };

      qtyPlus.onclick = () => {
        if (selectedQuantity < currentProduct.stock) {
          selectedQuantity++;
          qtyVal.value = selectedQuantity;
        } else {
          showToast(`Maximum available stock is ${currentProduct.stock}.`, 'info');
        }
      };
    }

    if (btnAddBag) {
      btnAddBag.onclick = async () => {
        if (!auth.isLoggedIn()) {
          showToast('Please log in to add items to your cart.', 'info');
          setTimeout(() => {
            window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
          }, 600);
          return;
        }

        try {
          await api.cart.add(currentProduct._id, selectedQuantity);
          showToast(`Added ${selectedQuantity} item(s) to your bag!`, 'success');
          window.dispatchEvent(new CustomEvent('cart-updated'));
        } catch (err) {
          showToast(err.message, 'error');
        }
      };
    }

    if (btnBuyNow) {
      btnBuyNow.onclick = async () => {
        if (!auth.isLoggedIn()) {
          showToast('Please log in to proceed with checkout.', 'info');
          setTimeout(() => {
            window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
          }, 600);
          return;
        }

        try {
          await api.cart.add(currentProduct._id, selectedQuantity);
          window.dispatchEvent(new CustomEvent('cart-updated'));
          window.location.href = '/checkout.html';
        } catch (err) {
          showToast(err.message, 'error');
        }
      };
    }

  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <h3 class="empty-title">Product Not Found</h3>
        <p class="empty-desc">${error.message}</p>
        <a href="/products.html" class="btn btn-primary">Browse All Products</a>
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  loadProductDetail();
});
