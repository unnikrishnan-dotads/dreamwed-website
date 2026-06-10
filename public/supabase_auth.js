// ============================================================
// DREAMWED STORIES — SUPABASE AUTH MODULE
// supabase_auth.js — Real phone OTP login via Supabase + Twilio
// ============================================================

const SUPABASE_URL  = 'https://iuiezdaeqtvlljymudra.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1aWV6ZGFlcXR2bGxqeW11ZHJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNDQ3MDYsImV4cCI6MjA5NTcyMDcwNn0.9paDnEe2HjUayK8jCG4w2jOoOeXOdwJipySqs0cQIFM';

// Initialize Supabase client (supabase-js v2 loaded via CDN in index.html)
const _supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// ── State ────────────────────────────────────────────────────
let dwCurrentUser    = null;   // Supabase auth user object
let dwCustomerProfile = null;  // row from customer_profiles
let dwBooking         = null;  // row from bookings

// ── Helpers ──────────────────────────────────────────────────
function formatPhoneE164(raw) {
  // strip spaces/dashes, ensure +91 prefix
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) return '+' + digits;
  if (digits.length === 10) return '+91' + digits;
  return '+' + digits;
}

// ── OTP Flow ─────────────────────────────────────────────────

/**
 * Step 1: Send OTP to phone number via Supabase → Twilio SMS
 * @param {string} phone  e.g. "9876543210" or "+919876543210"
 * @returns {Promise<void>}
 */
async function dwSendOtp(phone) {
  const e164 = formatPhoneE164(phone);
  const { error } = await _supa.auth.signInWithOtp({ phone: e164 });
  if (error) throw new Error(error.message);
  return e164;
}

/**
 * Step 2: Verify OTP entered by user
 * @param {string} phone   E.164 format (returned from dwSendOtp)
 * @param {string} token   6-digit OTP
 * @returns {Promise<object>} Supabase user object
 */
async function dwVerifyOtp(phone, token) {
  const { data, error } = await _supa.auth.verifyOtp({
    phone,
    token,
    type: 'sms'
  });
  if (error) throw new Error(error.message);
  dwCurrentUser = data.user;
  return data.user;
}

/**
 * Fetch or create customer profile after login
 * @returns {Promise<object>}
 */
async function dwFetchProfile() {
  const { data, error } = await _supa
    .from('customer_profiles')
    .select('*')
    .eq('id', dwCurrentUser.id)
    .single();

  if (error && error.code === 'PGRST116') {
    // No profile yet — create a skeleton row
    const phone = dwCurrentUser.phone;
    const { data: newProfile, error: insertError } = await _supa
      .from('customer_profiles')
      .insert({ id: dwCurrentUser.id, phone })
      .select()
      .single();
    if (insertError) throw new Error(insertError.message);
    dwCustomerProfile = newProfile;
  } else if (error) {
    throw new Error(error.message);
  } else {
    dwCustomerProfile = data;
  }
  return dwCustomerProfile;
}

/**
 * Fetch latest booking for logged-in customer
 * @returns {Promise<object|null>}
 */
async function dwFetchBooking() {
  const { data, error } = await _supa
    .from('bookings')
    .select('*')
    .eq('customer_id', dwCurrentUser.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  dwBooking = data;
  return data;
}

/**
 * Sign out current user
 */
async function dwSignOut() {
  await _supa.auth.signOut();
  dwCurrentUser     = null;
  dwCustomerProfile = null;
  dwBooking         = null;
}

/**
 * Restore existing session on page load (auto-login)
 * @param {Function} onLogin  called with (profile, booking) if session exists
 */
async function dwRestoreSession(onLogin) {
  const { data: { session } } = await _supa.auth.getSession();
  if (session && session.user) {
    dwCurrentUser = session.user;
    try {
      await dwFetchProfile();
      await dwFetchBooking();
      if (typeof onLogin === 'function') onLogin(dwCustomerProfile, dwBooking);
    } catch (e) {
      console.warn('DW session restore failed:', e.message);
    }
  }
}

/**
 * Listen for auth state changes (session refresh, logout, etc.)
 */
_supa.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_OUT') {
    dwCurrentUser     = null;
    dwCustomerProfile = null;
    dwBooking         = null;
    hideCustomerDashboard();
  }
});

// ── UI Controllers ───────────────────────────────────────────

function showLoginSection()  { 
  const el = document.getElementById('dwLoginSection');
  if (el) el.style.display = 'block'; 
}
function hideLoginSection()  { 
  const el = document.getElementById('dwLoginSection');
  if (el) el.style.display = 'none'; 
}
function showCustomerDashboard() {
  const dash = document.getElementById('customerDashboardSection');
  if (dash) dash.style.display = 'block';
  hideLoginSection();
  renderDwDashboard();
}
function hideCustomerDashboard() {
  const dash = document.getElementById('customerDashboardSection');
  if (dash) dash.style.display = 'none';
  showLoginSection();
}

/**
 * Populate the customer dashboard with real data from Supabase
 */
function renderDwDashboard() {
  if (!dwCustomerProfile) return;
  const p = dwCustomerProfile;
  const b = dwBooking;

  // Role badge
  const roleBadge = document.getElementById('custDashboardRoleBadge');
  if (roleBadge) {
    const roleEmoji = p.role === 'bride' ? '👰' : p.role === 'groom' ? '🤵' : '👤';
    const roleLabel = (p.role || 'Customer').charAt(0).toUpperCase() + (p.role || 'customer').slice(1);
    roleBadge.textContent = `${roleEmoji} ${roleLabel} Session`;
    roleBadge.style.background = p.role === 'bride' ? 'rgba(255,133,162,0.2)' : 'rgba(100,149,237,0.2)';
    roleBadge.style.color      = p.role === 'bride' ? '#ff85a2' : '#6495ed';
  }

  // Welcome name
  const welcomeEl = document.getElementById('custDashboardWelcomeName');
  if (welcomeEl) welcomeEl.textContent = p.name || 'Welcome!';

  // Package name
  const pkgEl = document.getElementById('custDashboardPackageName');
  if (pkgEl) pkgEl.textContent = (b && b.package) ? b.package : (p.package || '—');

  // Album progress bar
  if (b) {
    const prog = b.album_progress || 0;
    const bar  = document.getElementById('progressBarBride');
    if (bar) { bar.style.width = prog + '%'; }
    const txt  = document.getElementById('progressTextBride');
    if (txt)  { txt.textContent = `${prog}% Complete`; }

    // Status badge
    const statusMap = {
      pending:     { label: '⏳ Pending Confirmation', color: '#f39c12' },
      confirmed:   { label: '✅ Booking Confirmed',    color: '#2ecc71' },
      in_progress: { label: '🎞️ Album In Progress',   color: '#3498db' },
      delivered:   { label: '🎉 Delivered!',           color: '#9b59b6' }
    };
    const st = statusMap[b.status] || statusMap.pending;
    const statusEl = document.getElementById('dwBookingStatus');
    if (statusEl) {
      statusEl.textContent = st.label;
      statusEl.style.color = st.color;
    }

    // Drive link
    const driveEl = document.getElementById('dwDriveLink');
    if (driveEl && b.drive_link) {
      driveEl.href = b.drive_link;
      driveEl.style.display = 'inline-flex';
    }
  }
}

// ── Login Section Event Wiring ───────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Restore session if user revisits
  await dwRestoreSession((profile, booking) => {
    showCustomerDashboard();
  });

  // ── Send OTP button ──
  const btnSend = document.getElementById('dwBtnSendOtp');
  const phoneInput = document.getElementById('dwPhoneInput');
  const otpStep    = document.getElementById('dwOtpStep');
  const otpStatus  = document.getElementById('dwOtpStatus');
  let   pendingPhone = '';

  if (btnSend) {
    btnSend.addEventListener('click', async () => {
      const raw = (phoneInput?.value || '').trim();
      if (!raw || raw.replace(/\D/g,'').length < 10) {
        dwSetStatus(otpStatus, '⚠️ Please enter a valid 10-digit phone number.', 'warn');
        return;
      }
      btnSend.disabled = true;
      btnSend.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
      dwSetStatus(otpStatus, '', '');
      try {
        pendingPhone = await dwSendOtp(raw);
        otpStep.style.display = 'block';
        phoneInput.disabled   = true;
        btnSend.innerHTML     = '<i class="fa-solid fa-circle-check"></i> OTP Sent!';
        dwSetStatus(otpStatus, `✅ OTP sent to ${pendingPhone} via SMS. Check your phone.`, 'success');
        document.getElementById('dwOtpInput')?.focus();
      } catch (err) {
        btnSend.disabled  = false;
        btnSend.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send OTP';
        dwSetStatus(otpStatus, '❌ ' + err.message, 'error');
      }
    });
  }

  // ── Verify OTP button ──
  const btnVerify  = document.getElementById('dwBtnVerifyOtp');
  const otpInputEl = document.getElementById('dwOtpInput');

  if (btnVerify) {
    btnVerify.addEventListener('click', async () => {
      const token = (otpInputEl?.value || '').trim();
      if (!token || token.length !== 6) {
        dwSetStatus(otpStatus, '⚠️ Please enter the 6-digit OTP.', 'warn');
        return;
      }
      btnVerify.disabled = true;
      btnVerify.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying…';
      try {
        await dwVerifyOtp(pendingPhone, token);
        await dwFetchProfile();
        await dwFetchBooking();
        dwSetStatus(otpStatus, '✅ Verified! Loading your dashboard…', 'success');
        setTimeout(() => showCustomerDashboard(), 800);
      } catch (err) {
        btnVerify.disabled  = false;
        btnVerify.innerHTML = '<i class="fa-solid fa-lock-open"></i> Verify & Login';
        dwSetStatus(otpStatus, '❌ ' + err.message, 'error');
      }
    });
  }

  // ── Logout ──
  const btnLogout = document.getElementById('btnCustomerLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      await dwSignOut();
    });
  }

  // ── Navbar "Customer Portal" button → scroll to login or open modal ──
  const navPortalBtn = document.getElementById('btnCustomerPortalToggle');
  if (navPortalBtn) {
    navPortalBtn.addEventListener('click', (e) => {
      const loginSec = document.getElementById('dwLoginSection');
      if (loginSec) {
        e.preventDefault();
        loginSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const portalModal = document.getElementById('customerPortalModal');
        if (portalModal) {
          e.preventDefault();
          portalModal.style.display = 'flex';
        }
      }
    });
  }
});

// ── Utility ──────────────────────────────────────────────────
function dwSetStatus(el, msg, type) {
  if (!el) return;
  const colorMap = { success: '#2ecc71', error: '#ff5e5e', warn: '#f39c12', '': '' };
  el.textContent = msg;
  el.style.color = colorMap[type] || 'var(--text-muted)';
}
