/**
 * ShopSphere - Products Catalog Page Logic
 */
import { api, showToast } from './api.js';
import { auth } from './auth.js';
import { formatPrice, renderStars, updateCartBadge } from './main.js';

let currentFilters = {
  keyword: '',
  category: 'All',
  minPrice: '',
  maxPrice: '',
  sort: 'newest',
};

// Add to Cart handler
export const handleAddToCart = async (productId, e) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (!auth.isLoggedIn()) {
    showToast('Please log in to add items to your cart.', 'info');
    setTimeout(() => {
      window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }, 600);
    return;
  }

  try {
    await api.cart.add(productId, 1);
    showToast('Item added to your shopping bag!', 'success');
    window.dispatchEvent(new CustomEvent('cart-updated'));
  } catch (error) {
    showToast(error.message || 'Could not add item to cart', 'error');
  }
};

export const renderProductCard = (product) => {
  const effectivePrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price;
  
  let stockClass = 'stock-in';
  let stockLabel = `${product.stock} in stock`;
  if (product.stock === 0) {
    stockClass = 'stock-out';
    stockLabel = 'Out of stock';
  } else if (product.stock <= 5) {
    stockClass = 'stock-low';
    stockLabel = `Only ${product.stock} left`;
  }

  return `
    <article class="product-card">
      <div class="product-img-wrap">
        <a href="/product.html?id=${product._id}">
          <img 
            src="${product.image}" 
            alt="${product.name}" 
            class="product-img" 
            loading="lazy" 
            onerror="this.src='/src/assets/images/hero_shopsphere_banner_1790769913067.jpg'"
          />
        </a>
        ${hasDiscount ? `<span class="product-discount-tag">Save ${formatPrice(product.price - product.discountPrice)}</span>` : ''}
      </div>

      <div class="product-body">
        <div class="product-meta">
          <span>${product.category}</span>
          ${product.brand ? `<span aria-hidden="true">&middot;</span><span>${product.brand}</span>` : ''}
        </div>

        <h3 class="product-title">
          <a href="/product.html?id=${product._id}">${product.name}</a>
        </h3>

        <div class="product-rating">
          ${renderStars(product.rating)}
          <span style="font-weight:600;margin-left:0.2rem;">${product.rating.toFixed(1)}</span>
          <span style="color:var(--text-muted);font-size:0.75rem;">(${product.numReviews})</span>
        </div>

        <div class="product-price-row">
          <span class="current-price tabular-nums">${formatPrice(effectivePrice)}</span>
          ${hasDiscount ? `<span class="original-price tabular-nums">${formatPrice(product.price)}</span>` : ''}
          <span class="stock-indicator ${stockClass}">${stockLabel}</span>
        </div>

        <div class="product-actions">
          <a href="/product.html?id=${product._id}" class="btn btn-secondary btn-sm" style="font-size:0.8rem;">
            Details
          </a>
          <button 
            onclick="window.handleAddToCart('${product._id}', event)" 
            class="btn btn-primary btn-sm" 
            ${product.stock === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}
            style="font-size:0.8rem;"
          >
            Add to Bag
          </button>
        </div>
      </div>
    </article>
  `;
};

// Render loading skeletons
const renderSkeletons = (count = 8) => {
  let skeletons = '';
  for (let i = 0; i < count; i++) {
    skeletons += `
      <div class="product-card" style="border: 1px solid var(--border-light);">
        <div class="skeleton" style="aspect-ratio: 4/3; width: 100%;"></div>
        <div style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">
          <div class="skeleton" style="height: 12px; width: 40%;"></div>
          <div class="skeleton" style="height: 20px; width: 90%;"></div>
          <div class="skeleton" style="height: 14px; width: 50%;"></div>
          <div class="skeleton" style="height: 24px; width: 35%; margin-top: 0.5rem;"></div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.5rem;">
            <div class="skeleton" style="height: 32px;"></div>
            <div class="skeleton" style="height: 32px;"></div>
          </div>
        </div>
      </div>
    `;
  }
  return skeletons;
};

// Fetch and display products
export const loadProducts = async () => {
  const gridEl = document.getElementById('products-grid');
  const countEl = document.getElementById('products-count');
  if (!gridEl) return;

  gridEl.innerHTML = renderSkeletons();

  try {
    const data = await api.products.getAll(currentFilters);
    const products = data.products || [];

    if (countEl) {
      countEl.textContent = `Showing ${products.length} product${products.length === 1 ? '' : 's'}`;
    }

    if (products.length === 0) {
      gridEl.innerHTML = `
        <div style="grid-column: 1 / -1;">
          <div class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <h3 class="empty-title">No matching products found</h3>
            <p class="empty-desc">We couldn't find any products matching your selected criteria. Try adjusting your search keyword or clearing category filters.</p>
            <button id="reset-filters-btn" class="btn btn-secondary">Reset All Filters</button>
          </div>
        </div>
      `;

      const resetBtn = document.getElementById('reset-filters-btn');
      if (resetBtn) {
        resetBtn.onclick = () => {
          currentFilters = { keyword: '', category: 'All', minPrice: '', maxPrice: '', sort: 'newest' };
          const searchInput = document.getElementById('search-input');
          if (searchInput) searchInput.value = '';
          const categoryBtns = document.querySelectorAll('.category-filter-btn');
          categoryBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.category === 'All'));
          const sortSelect = document.getElementById('sort-select');
          if (sortSelect) sortSelect.value = 'newest';
          loadProducts();
        };
      }
      return;
    }

    gridEl.innerHTML = products.map(renderProductCard).join('');
  } catch (error) {
    gridEl.innerHTML = `
      <div style="grid-column: 1 / -1;">
        <div class="empty-state">
          <p style="color:var(--accent-danger);font-weight:600;margin-bottom:0.5rem;">Failed to load catalog</p>
          <p class="empty-desc">${error.message}</p>
          <button onclick="window.loadProducts()" class="btn btn-primary">Try Again</button>
        </div>
      </div>
    `;
  }
};

// Initialize filter listeners on page
export const initProductFilters = () => {
  // Read URL queries on load
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  const keywordParam = urlParams.get('keyword');

  if (categoryParam) currentFilters.category = categoryParam;
  if (keywordParam) currentFilters.keyword = keywordParam;

  // Search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    if (keywordParam) searchInput.value = keywordParam;

    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentFilters.keyword = e.target.value.trim();
        loadProducts();
      }, 300);
    });
  }

  // Category filter buttons
  const categoryBtns = document.querySelectorAll('.category-filter-btn');
  categoryBtns.forEach((btn) => {
    if (btn.dataset.category === currentFilters.category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }

    btn.addEventListener('click', () => {
      categoryBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilters.category = btn.dataset.category;
      loadProducts();
    });
  });

  // Price range filters
  const applyPriceBtn = document.getElementById('apply-price-filter');
  const minPriceInput = document.getElementById('min-price-input');
  const maxPriceInput = document.getElementById('max-price-input');

  if (applyPriceBtn) {
    applyPriceBtn.addEventListener('click', () => {
      currentFilters.minPrice = minPriceInput?.value || '';
      currentFilters.maxPrice = maxPriceInput?.value || '';
      loadProducts();
    });
  }

  // Sorting
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentFilters.sort = e.target.value;
      loadProducts();
    });
  }

  loadProducts();
};

// Expose handleAddToCart to window for inline onclick attributes
window.handleAddToCart = handleAddToCart;
window.loadProducts = loadProducts;
