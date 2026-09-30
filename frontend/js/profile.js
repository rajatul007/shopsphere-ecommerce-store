/**
 * ShopSphere - User Profile Manager
 */
import { api, showToast } from './api.js';
import { auth } from './auth.js';

export const loadProfile = async () => {
  const container = document.getElementById('profile-container');
  if (!container) return;

  if (!auth.requireAuth('/profile.html')) return;

  try {
    const data = await api.users.getProfile();
    const user = data.user;
    const address = user.address || {};

    const memberDate = new Date(user.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    container.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr;gap:2rem;">
        <!-- Top Profile Header Card -->
        <div class="checkout-card" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1.5rem;">
          <div style="display:flex;align-items:center;gap:1.25rem;">
            <div style="width:64px;height:64px;border-radius:50%;background:var(--accent-primary);color:#fff;font-size:1.5rem;font-weight:700;display:flex;align-items:center;justify-content:center;">
              ${user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style="font-size:1.35rem;font-weight:700;color:var(--text-primary);">${user.name}</h2>
              <div style="display:flex;gap:0.75rem;align-items:center;font-size:0.85rem;color:var(--text-muted);margin-top:0.2rem;">
                <span>${user.email}</span>
                <span>&middot;</span>
                <span style="text-transform:capitalize;font-weight:600;color:var(--text-secondary);">${user.role} Account</span>
                <span>&middot;</span>
                <span>Member since ${memberDate}</span>
              </div>
            </div>
          </div>
          <div style="display:flex;gap:0.75rem;">
            <a href="/orders.html" class="btn btn-secondary btn-sm">View Order History</a>
            ${user.role === 'admin' ? '<a href="/admin.html" class="btn btn-primary btn-sm">Admin Dashboard</a>' : ''}
          </div>
        </div>

        <!-- 2 Columns: Edit Profile & Password -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:2rem;">
          <!-- Profile & Address Form -->
          <div class="checkout-card">
            <h3 class="checkout-card-title">Personal & Default Shipping Details</h3>
            <form id="profile-form">
              <div class="form-group">
                <label class="form-label" for="prof-name">Full Name</label>
                <input type="text" id="prof-name" class="form-control" value="${user.name || ''}" required />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="prof-email">Email Address</label>
                  <input type="email" id="prof-email" class="form-control" value="${user.email || ''}" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="prof-phone">Phone Number</label>
                  <input type="tel" id="prof-phone" class="form-control" value="${user.phone || ''}" placeholder="+1 (555) 000-0000" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="prof-street">Street Address</label>
                <input type="text" id="prof-street" class="form-control" value="${address.address || ''}" placeholder="123 Ocean Blvd" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="prof-city">City</label>
                  <input type="text" id="prof-city" class="form-control" value="${address.city || ''}" placeholder="San Francisco" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="prof-state">State</label>
                  <input type="text" id="prof-state" class="form-control" value="${address.state || ''}" placeholder="CA" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="prof-zip">Postal / Zip Code</label>
                  <input type="text" id="prof-zip" class="form-control" value="${address.postalCode || ''}" placeholder="94105" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="prof-country">Country</label>
                  <input type="text" id="prof-country" class="form-control" value="${address.country || 'United States'}" />
                </div>
              </div>

              <button type="submit" id="save-profile-btn" class="btn btn-primary" style="margin-top:0.5rem;">
                Save Changes
              </button>
            </form>
          </div>

          <!-- Password Reset Card -->
          <div class="checkout-card" style="height:fit-content;">
            <h3 class="checkout-card-title">Security & Password</h3>
            <form id="password-form">
              <div class="form-group">
                <label class="form-label" for="new-pass">New Password</label>
                <input type="password" id="new-pass" class="form-control" placeholder="Minimum 6 characters" minlength="6" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="confirm-pass">Confirm New Password</label>
                <input type="password" id="confirm-pass" class="form-control" placeholder="Re-enter new password" minlength="6" required />
              </div>

              <button type="submit" id="save-pass-btn" class="btn btn-secondary">
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    // Hook forms
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.onsubmit = async (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById('save-profile-btn');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        try {
          const updateData = {
            name: document.getElementById('prof-name').value.trim(),
            email: document.getElementById('prof-email').value.trim(),
            phone: document.getElementById('prof-phone').value.trim(),
            address: {
              address: document.getElementById('prof-street').value.trim(),
              city: document.getElementById('prof-city').value.trim(),
              state: document.getElementById('prof-state').value.trim(),
              postalCode: document.getElementById('prof-zip').value.trim(),
              country: document.getElementById('prof-country').value.trim(),
            },
          };

          const res = await api.users.updateProfile(updateData);
          showToast('Profile updated successfully!', 'success');
          await auth.init(); // Refresh memory state
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save Changes';
        }
      };
    }

    const passForm = document.getElementById('password-form');
    if (passForm) {
      passForm.onsubmit = async (e) => {
        e.preventDefault();
        const newPass = document.getElementById('new-pass').value;
        const confirmPass = document.getElementById('confirm-pass').value;

        if (newPass !== confirmPass) {
          showToast('Passwords do not match.', 'error');
          return;
        }

        const passBtn = document.getElementById('save-pass-btn');
        passBtn.disabled = true;

        try {
          await api.users.updateProfile({ password: newPass });
          showToast('Password updated successfully!', 'success');
          passForm.reset();
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          passBtn.disabled = false;
        }
      };
    }

  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <h3 class="empty-title">Error Loading Profile</h3>
        <p class="empty-desc">${error.message}</p>
        <button onclick="window.loadProfile()" class="btn btn-primary">Try Again</button>
      </div>
    `;
  }
};

window.loadProfile = loadProfile;

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
});
