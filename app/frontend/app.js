/* ================================================================
   ProductHub — Complete SPA
   FastAPI + PostgreSQL Frontend
   Features: Auth, Dashboard, Products CRUD, Like, Search, Sort,
             Grid/List Toggle, Modals, Toasts, Responsive
================================================================ */

"use strict";

// ── CONFIG ───────────────────────────────────────────────────────────────────
// Change to 'http://localhost:8000' if opening index.html directly (not via FastAPI)
const API = "";

// ── STATE ────────────────────────────────────────────────────────────────────
const state = {
  token: localStorage.getItem("ph_token") || null,
  user: JSON.parse(localStorage.getItem("ph_user") || "null"),
  products: [],
  filtered: [],
  liked: new Set(JSON.parse(localStorage.getItem("ph_likes") || "[]")),
  currentView: "dashboard",
  viewMode: localStorage.getItem("ph_viewmode") || "grid",
  search: "",
  sort: "name",
  loadingProds: false,
  deleteTarget: null, // { id, name }
  editTarget: null, // product object | null  (null = create mode)
};

// ── API HELPER ───────────────────────────────────────────────────────────────
async function apiCall(method, path, body = null, auth = true) {
  const headers = {};
  if (auth && state.token) headers["Authorization"] = `Bearer ${state.token}`;

  const opts = { method, headers };

  if (body instanceof URLSearchParams) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    opts.body = body.toString();
  } else if (body !== null) {
    headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(API + path, opts);

    // Token expired or invalid → force logout
    if (res.status === 401 && auth) {
      logout(true);
      return null;
    }

    const data = res.status === 204 ? null : await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error("[API Error]", method, path, err);
    return { ok: false, status: 0, data: null };
  }
}

// ── AUTH — LOGIN ─────────────────────────────────────────────────────────────
async function doLogin(email, password) {
  const form = new URLSearchParams();
  form.append("username", email); // OAuth2PasswordRequestForm uses 'username'
  form.append("password", password);
  return apiCall("POST", "/login", form, false);
}

// ── AUTH — REGISTER ──────────────────────────────────────────────────────────
async function doRegister(email, password) {
  return apiCall("POST", "/Users/", { email, password }, false);
}

// ── AUTH — PERSIST ───────────────────────────────────────────────────────────
function saveAuth(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem("ph_token", token);
  localStorage.setItem("ph_user", JSON.stringify(user));
}

// ── AUTH — LOGOUT ────────────────────────────────────────────────────────────
function logout(silent = false) {
  state.token = null;
  state.user = null;
  state.products = [];
  state.filtered = [];
  localStorage.removeItem("ph_token");
  localStorage.removeItem("ph_user");
  showAuth();
  if (!silent) toast("Signed out successfully", "info");
}

// ── PRODUCTS — FETCH ─────────────────────────────────────────────────────────
async function fetchProducts(limit = 100, skip = 0) {
  return apiCall("GET", `/products/?limit=${limit}&skip=${skip}`);
}

// ── PRODUCTS — CREATE ────────────────────────────────────────────────────────
async function createProduct(data) {
  return apiCall("POST", "/products/", data);
}

// ── PRODUCTS — UPDATE ────────────────────────────────────────────────────────
async function updateProduct(id, data) {
  return apiCall("PUT", `/products/${id}`, data);
}

// ── PRODUCTS — DELETE ────────────────────────────────────────────────────────
async function deleteProductById(id) {
  return apiCall("DELETE", `/products/${id}`);
}

// ── PRODUCTS — LIKE / UNLIKE ─────────────────────────────────────────────────
// dir: 1 = like, 0 = unlike  — caller must pass the intended direction
// explicitly so that optimistic UI updates in handleLike don't corrupt
// the direction calculation here.
async function toggleLike(prodId, dir) {
  const res = await apiCall("POST", "/like/", { prod_id: prodId, dir });
  if (!res) return false;

  if (res.ok) {
    if (dir === 1) {
      state.liked.add(prodId);
      toast("Added to favourites ❤️", "success");
    } else {
      state.liked.delete(prodId);
      toast("Removed from favourites", "info");
    }
    localStorage.setItem("ph_likes", JSON.stringify([...state.liked]));
    return true;
  }

  // 409 = already liked, 404 = not liked — sync local state to reality
  if (res.status === 409) {
    state.liked.add(prodId);
    localStorage.setItem("ph_likes", JSON.stringify([...state.liked]));
  } else if (res.status === 404 && dir === 0) {
    state.liked.delete(prodId);
    localStorage.setItem("ph_likes", JSON.stringify([...state.liked]));
  }

  const detail = res.data?.detail || "Action failed";
  toast(detail, "error");
  return false;
}

// ── LOAD ALL PRODUCTS ────────────────────────────────────────────────────────
async function loadProducts() {
  if (state.loadingProds) return;
  state.loadingProds = true;
  showProductsLoading();

  const res = await fetchProducts();
  state.loadingProds = false;

  if (!res || !res.ok) {
    toast(res?.data?.detail || "Failed to load products", "error");
    showProductsError();
    return;
  }

  state.products = Array.isArray(res.data) ? res.data : [];
  applyFilters();
  updateStats();
  updateNavBadge();

  if (state.currentView === "products") renderProducts();
  if (state.currentView === "dashboard") renderDashboard();
  if (state.currentView === "profile") renderProfile();
}

async function refreshProducts() {
  toast("Refreshing data…", "info");
  await loadProducts();
  toast(
    `✓ ${state.products.length} product${state.products.length !== 1 ? "s" : ""} loaded`,
    "success",
  );
}

// ── FILTERING & SORTING ──────────────────────────────────────────────────────
function applyFilters() {
  let list = [...state.products];

  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        String(p.price).includes(q) ||
        String(p.inventory).includes(q),
    );
  }

  switch (state.sort) {
    case "name":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      list.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "inventory":
      list.sort((a, b) => b.inventory - a.inventory);
      break;
    case "newest":
      list.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
      break;
    default:
      break;
  }

  state.filtered = list;
}

function handleSearch(q) {
  state.search = q.trim();
  const clearBtn = el("search-clear");
  if (clearBtn) clearBtn.classList.toggle("hidden", !state.search);
  applyFilters();
  renderProducts();
  updateSubtitle();
}

function clearSearch() {
  state.search = "";
  const inp = el("search-input");
  if (inp) inp.value = "";
  const clearBtn = el("search-clear");
  if (clearBtn) clearBtn.classList.add("hidden");
  applyFilters();
  renderProducts();
  updateSubtitle();
}

function handleSort(val) {
  state.sort = val;
  applyFilters();
  renderProducts();
}

function updateSubtitle() {
  const sub = el("prod-subtitle");
  if (!sub) return;
  const total = state.products.length;
  const shown = state.filtered.length;
  if (state.search) {
    sub.textContent = `${shown} of ${total} product${total !== 1 ? "s" : ""} match "${state.search}"`;
  } else {
    sub.textContent =
      total === 0
        ? "No products yet"
        : `${total} product${total !== 1 ? "s" : ""}`;
  }
}

// ── STATS ────────────────────────────────────────────────────────────────────
function updateStats() {
  const prods = state.products;
  const total = prods.length;
  const value = prods.reduce((s, p) => s + p.price * p.inventory, 0);
  const stock = prods.reduce((s, p) => s + p.inventory, 0);
  const avg = total
    ? Math.round(prods.reduce((s, p) => s + p.price, 0) / total)
    : 0;

  animateNumber("s-total", total, false);
  animateNumber("s-stock", stock, false);
  setText("s-value", fmtMoney(value));
  setText("s-avg", fmtMoney(avg));

  // Profile stats
  setText("p-total", String(total));
  setText("p-value", fmtMoney(value));
}

function animateNumber(id, target, isMoney = false) {
  const elem = el(id);
  if (!elem) return;
  const from = parseInt(elem.textContent.replace(/\D/g, ""), 10) || 0;
  const delta = target - from;
  const steps = 25;
  let step = 0;
  clearInterval(elem._anim);
  elem._anim = setInterval(() => {
    step++;
    const val = Math.round(from + delta * easeOut(step / steps));
    elem.textContent = isMoney ? fmtMoney(val) : val;
    if (step >= steps) {
      clearInterval(elem._anim);
      elem.textContent = isMoney ? fmtMoney(target) : target;
    }
  }, 20);
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

function updateNavBadge() {
  const badge = el("nav-badge");
  if (badge) badge.textContent = state.products.length;
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
function renderDashboard() {
  renderRecentProducts();
}

function renderRecentProducts() {
  const container = el("recent-list");
  if (!container) return;

  if (state.products.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:30px 0">
        <div class="empty-icon">📦</div>
        <h3>No products yet</h3>
        <p>Create your first product to get started</p>
        <button class="btn-primary" style="margin-top:8px" onclick="openProductModal()">+ New Product</button>
      </div>`;
    return;
  }

  const recent = [...state.products]
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    .slice(0, 5);

  container.innerHTML = recent
    .map(
      (p) => `
    <div class="recent-row">
      <div class="recent-icon">${productEmoji(p.name)}</div>
      <div class="recent-info">
        <div class="recent-name">${escHtml(p.name)}</div>
        <div class="recent-meta">${p.inventory} unit${p.inventory !== 1 ? "s" : ""} in stock</div>
      </div>
      <div class="recent-price">${fmtMoney(p.price)}</div>
    </div>
  `,
    )
    .join("");
}

// ── PRODUCTS VIEW ─────────────────────────────────────────────────────────────
function showProductsLoading() {
  const c = el("products-container");
  if (!c) return;
  c.innerHTML = `
    <div class="skeleton-list" style="grid-column:1/-1">
      ${Array(6).fill('<div class="skel-item" style="height:200px;border-radius:12px"></div>').join("")}
    </div>`;
  c.className = "prods-grid";
}

function showProductsError() {
  const c = el("products-container");
  if (!c) return;
  c.innerHTML = `
    <div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">⚠️</div>
      <h3>Failed to load products</h3>
      <p>Check your connection and try again</p>
      <button class="btn-primary" style="margin-top:12px" onclick="loadProducts()">Retry</button>
    </div>`;
}

function renderProducts() {
  const c = el("products-container");
  if (!c) return;

  updateSubtitle();

  if (state.filtered.length === 0) {
    c.className = "prods-grid";
    if (state.products.length === 0) {
      c.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-icon">📦</div>
          <h3>No products yet</h3>
          <p>Click "New Product" to add your first item to the inventory</p>
          <button class="btn-primary" style="margin-top:14px" onclick="openProductModal()">+ New Product</button>
        </div>`;
    } else {
      c.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-icon">🔍</div>
          <h3>No results for "${escHtml(state.search)}"</h3>
          <p>Try a different search term or clear the filter</p>
          <button class="btn-ghost" style="margin-top:12px" onclick="clearSearch()">Clear Search</button>
        </div>`;
    }
    return;
  }

  if (state.viewMode === "list") {
    c.className = "prods-list";
    c.innerHTML = state.filtered.map((p, i) => buildProductRow(p, i)).join("");
  } else {
    c.className = "prods-grid";
    c.innerHTML = state.filtered.map((p, i) => buildProductCard(p, i)).join("");
  }
}

// ── PRODUCT CARD (GRID) ───────────────────────────────────────────────────────
function buildProductCard(p, index) {
  const liked = state.liked.has(p.id);
  const stockBadge = stockBadgeHtml(p.inventory);
  const date = fmtDate(p.published_at);
  const owner = p.owner?.email || "";

  return `
    <div class="prod-card" style="animation-delay:${Math.min(index * 0.04, 0.3)}s">
      <div class="prod-card-top">
        <div class="prod-emoji">${productEmoji(p.name)}</div>
        <button class="like-btn ${liked ? "liked" : ""}"
                onclick="handleLike(${p.id}, this)"
                title="${liked ? "Unlike" : "Like"} this product"
                aria-label="${liked ? "Unlike" : "Like"}">
          ${liked ? "❤️" : "🤍"}
        </button>
      </div>

      <div class="prod-name" title="${escHtml(p.name)}">${escHtml(p.name)}</div>

      <div class="prod-price">
        ${fmtMoney(p.price)}<span> / unit</span>
      </div>

      <div class="prod-badges">
        ${stockBadge}
      </div>

      <div class="prod-meta">
        ${owner ? `<span>Owner: ${escHtml(owner)}</span>` : ""}
        ${date ? `<span>Added: ${date}</span>` : ""}
      </div>

      <div class="prod-actions">
        <button class="btn-edit-sm" onclick="openProductModal(${p.id})" title="Edit">
          ✏️ Edit
        </button>
        <button class="btn-del-sm" onclick="openDeleteModal(${p.id}, '${escAttr(p.name)}')" title="Delete">
          🗑 Delete
        </button>
      </div>
    </div>`;
}

// ── PRODUCT ROW (LIST) ────────────────────────────────────────────────────────
function buildProductRow(p, index) {
  const liked = state.liked.has(p.id);
  const stockBadge = stockBadgeHtml(p.inventory);

  return `
    <div class="prod-row" style="animation-delay:${Math.min(index * 0.03, 0.25)}s">
      <div class="prod-row-icon">${productEmoji(p.name)}</div>
      <div class="prod-row-name" title="${escHtml(p.name)}">${escHtml(p.name)}</div>
      <div class="prod-row-price">${fmtMoney(p.price)}</div>
      <div class="prod-row-stock">${stockBadge}</div>
      <div class="prod-row-actions">
        <button class="icon-btn like ${liked ? "liked" : ""}"
                onclick="handleLike(${p.id}, this)"
                title="${liked ? "Unlike" : "Like"}">
          ${liked ? "❤️" : "🤍"}
        </button>
        <button class="icon-btn edit" onclick="openProductModal(${p.id})" title="Edit">✏️</button>
        <button class="icon-btn del" onclick="openDeleteModal(${p.id}, '${escAttr(p.name)}')" title="Delete">🗑</button>
      </div>
    </div>`;
}

// ── LIKE HANDLER (with optimistic UI) ────────────────────────────────────────
async function handleLike(prodId, btn) {
  // Capture intended direction BEFORE any state mutation
  const wasLiked = state.liked.has(prodId);
  const dir = wasLiked ? 0 : 1;

  // Optimistic UI update
  if (wasLiked) {
    state.liked.delete(prodId);
    btn.textContent = "🤍";
    btn.classList.remove("liked");
    btn.title = "Like";
  } else {
    state.liked.add(prodId);
    btn.textContent = "❤️";
    btn.classList.add("liked");
    btn.title = "Unlike";
  }

  btn.disabled = true;
  // Pass dir explicitly — state.liked is already mutated at this point
  const ok = await toggleLike(prodId, dir);
  btn.disabled = false;

  // Revert on failure
  if (!ok) {
    if (wasLiked) {
      state.liked.add(prodId);
      btn.textContent = "❤️";
      btn.classList.add("liked");
      btn.title = "Unlike";
    } else {
      state.liked.delete(prodId);
      btn.textContent = "🤍";
      btn.classList.remove("liked");
      btn.title = "Like";
    }
    localStorage.setItem("ph_likes", JSON.stringify([...state.liked]));
  }
}

// ── STOCK BADGE ───────────────────────────────────────────────────────────────
function stockBadgeHtml(inventory) {
  if (inventory === 0)
    return `<span class="badge badge-stock-none">Out of stock</span>`;
  if (inventory <= 5)
    return `<span class="badge badge-stock-low">⚠ Low: ${inventory}</span>`;
  return `<span class="badge badge-stock">✓ ${inventory} units</span>`;
}

// ── PROFILE VIEW ──────────────────────────────────────────────────────────────
function renderProfile() {
  if (!state.user) return;

  const u = state.user;
  const initials = getInitials(u.email);
  const total = state.products.length;
  const portfolio = state.products.reduce(
    (s, p) => s + p.price * p.inventory,
    0,
  );

  setText("profile-avatar", initials);
  setText("profile-name", u.email);
  setText("p-total", String(total));
  setText("p-value", fmtMoney(portfolio));
  setText("p-id", String(u.id || "—"));
  setText("p-email", u.email || "—");
  setText("p-since", u.created_at ? fmtDate(u.created_at) : "—");
  setText("p-products", `${total} product${total !== 1 ? "s" : ""}`);
  setText("p-portfolio", fmtMoney(portfolio));
}

// ── PRODUCT MODAL ─────────────────────────────────────────────────────────────
function openProductModal(productId = null) {
  const overlay = el("product-modal");
  const title = el("modal-title");
  const submit = el("modal-submit");
  const editIdEl = el("edit-id");
  const nameEl = el("f-name");
  const priceEl = el("f-price");
  const invEl = el("f-inventory");
  const errEl = el("modal-err");

  hideEl(errEl);
  resetBtnState(submit, "Create Product");

  if (productId !== null) {
    // EDIT MODE
    const p = state.products.find((x) => x.id === productId);
    if (!p) {
      toast("Product not found", "error");
      return;
    }

    state.editTarget = p;
    title.textContent = "Edit Product";
    submit.querySelector(".btn-label").textContent = "Save Changes";
    editIdEl.value = p.id;
    nameEl.value = p.name;
    priceEl.value = p.price;
    invEl.value = p.inventory;
  } else {
    // CREATE MODE
    state.editTarget = null;
    title.textContent = "New Product";
    submit.querySelector(".btn-label").textContent = "Create Product";
    editIdEl.value = "";
    nameEl.value = "";
    priceEl.value = "";
    invEl.value = "";
  }

  overlay.classList.remove("hidden");
  setTimeout(() => nameEl.focus(), 80);
}

function closeProductModal() {
  const overlay = el("product-modal");
  overlay.classList.add("hidden");
  state.editTarget = null;
}

function handleModalOverlay(e) {
  if (e.target === el("product-modal")) closeProductModal();
}

async function submitProductForm(e) {
  e.preventDefault();

  const name = el("f-name").value.trim();
  const price = parseInt(el("f-price").value, 10);
  const inventory = parseInt(el("f-inventory").value, 10);
  const errEl = el("modal-err");
  const submit = el("modal-submit");

  // Validate
  if (!name) {
    showFormErr(errEl, "Product name is required.");
    el("f-name").focus();
    return;
  }
  if (isNaN(price) || price < 0) {
    showFormErr(errEl, "Enter a valid price (0 or greater).");
    el("f-price").focus();
    return;
  }
  if (isNaN(inventory) || inventory < 0) {
    showFormErr(errEl, "Enter a valid stock quantity (0 or greater).");
    el("f-inventory").focus();
    return;
  }

  hideEl(errEl);
  setBtnLoading(submit, true);

  const data = { name, price, inventory };
  let res;

  if (state.editTarget) {
    res = await updateProduct(state.editTarget.id, data);
  } else {
    res = await createProduct(data);
  }

  setBtnLoading(submit, false);

  if (!res) {
    showFormErr(errEl, "Network error. Please try again.");
    return;
  }

  if (!res.ok) {
    const msg =
      res.data?.detail ||
      (state.editTarget ? "Update failed." : "Create failed.");
    showFormErr(errEl, msg);
    return;
  }

  closeProductModal();
  toast(
    state.editTarget ? "✓ Product updated!" : "✓ Product created!",
    "success",
  );
  await loadProducts();
}

// ── DELETE MODAL ──────────────────────────────────────────────────────────────
function openDeleteModal(id, name) {
  state.deleteTarget = { id, name };
  const el_name = el("delete-product-name");
  if (el_name) el_name.textContent = name;
  const overlay = el("delete-modal");
  if (overlay) overlay.classList.remove("hidden");
  resetBtnState(el("confirm-delete-btn"), "Delete");
}

function closeDeleteModal() {
  const overlay = el("delete-modal");
  if (overlay) overlay.classList.add("hidden");
  state.deleteTarget = null;
}

function handleDeleteOverlay(e) {
  if (e.target === el("delete-modal")) closeDeleteModal();
}

async function confirmDelete() {
  if (!state.deleteTarget) return;

  const { id, name } = state.deleteTarget;
  const btn = el("confirm-delete-btn");
  setBtnLoading(btn, true);

  const res = await deleteProductById(id);
  setBtnLoading(btn, false);

  if (!res) {
    toast("Network error. Please try again.", "error");
    closeDeleteModal();
    return;
  }

  if (res.ok || res.status === 204) {
    closeDeleteModal();
    // Remove from local state immediately for instant UI feedback
    state.products = state.products.filter((p) => p.id !== id);
    state.liked.delete(id);
    localStorage.setItem("ph_likes", JSON.stringify([...state.liked]));
    applyFilters();
    updateStats();
    updateNavBadge();
    if (state.currentView === "products") renderProducts();
    if (state.currentView === "dashboard") renderDashboard();
    toast(`🗑 "${name}" deleted`, "success");
  } else {
    const msg = res.data?.detail || "Delete failed. You may not be the owner.";
    toast(msg, "error");
    closeDeleteModal();
  }
}

// ── VIEW NAVIGATION ───────────────────────────────────────────────────────────
function setView(view) {
  state.currentView = view;

  // Update sections
  const views = ["dashboard", "products", "profile"];
  views.forEach((v) => {
    const sec = el(`view-${v}`);
    if (sec) sec.classList.toggle("hidden", v !== view);
  });

  // Update nav buttons
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });

  // Update topbar title
  const titles = {
    dashboard: "Dashboard",
    products: "Products",
    profile: "Profile",
  };
  setText("topbar-title", titles[view] || "");

  // Render the correct view
  if (view === "products") {
    applyFilters();
    renderProducts();
    updateSubtitle();
  } else if (view === "dashboard") {
    renderDashboard();
    updateStats();
  } else if (view === "profile") {
    renderProfile();
  }

  closeSidebar();
  window.scrollTo(0, 0);
}

// ── VIEW MODE (GRID / LIST) ───────────────────────────────────────────────────
function setViewMode(mode) {
  state.viewMode = mode;
  localStorage.setItem("ph_viewmode", mode);

  el("tog-grid").classList.toggle("active", mode === "grid");
  el("tog-list").classList.toggle("active", mode === "list");

  renderProducts();
}

// ── SIDEBAR (MOBILE) ──────────────────────────────────────────────────────────
function openSidebar() {
  el("sidebar").classList.add("open");
  el("sidebar-backdrop").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeSidebar() {
  el("sidebar").classList.remove("open");
  el("sidebar-backdrop").classList.add("hidden");
  document.body.style.overflow = "";
}

// ── AUTH SCREEN ───────────────────────────────────────────────────────────────
function showAuth() {
  el("auth-screen").classList.remove("hidden");
  el("app-screen").classList.add("hidden");
  showPanel("login");
}

function showApp() {
  el("auth-screen").classList.add("hidden");
  el("app-screen").classList.remove("hidden");
  updateUserUI();
  setView(state.currentView || "dashboard");
  loadProducts();
}

// ── PANEL SWITCH (login ↔ register) ──────────────────────────────────────────
function showPanel(which) {
  el("login-panel").classList.toggle("hidden", which !== "login");
  el("register-panel").classList.toggle("hidden", which !== "register");

  if (which === "login") {
    hideEl(el("login-err"));
    el("login-email").focus();
  } else {
    hideEl(el("register-err"));
    el("reg-email").focus();
  }
}

// ── USER UI ───────────────────────────────────────────────────────────────────
function updateUserUI() {
  if (!state.user) return;
  const email = state.user.email || "";
  const initials = getInitials(email);

  setText("sidebar-avatar", initials);
  setText("sidebar-email", email);
  setText("topbar-avatar", initials);
  setText("topbar-email", email);
  setText("profile-avatar", initials);
  setText("profile-name", email);
}

// ── PASSWORD VISIBILITY TOGGLE ────────────────────────────────────────────────
function togglePassword(targetId) {
  const input = document.getElementById(targetId);
  if (!input) return;
  input.type = input.type === "password" ? "text" : "password";
}

// ── TOAST SYSTEM ──────────────────────────────────────────────────────────────
const TOAST_ICONS = {
  success: "✅",
  error: "❌",
  info: "ℹ️",
  warning: "⚠️",
};

function toast(message, type = "success", duration = 3500) {
  const container = el("toast-container");
  if (!container) return;

  const div = document.createElement("div");
  div.className = `toast toast-${type}`;
  div.style.setProperty("--toast-dur", `${duration}ms`);
  div.innerHTML = `
    <span class="toast-icon">${TOAST_ICONS[type] || "ℹ️"}</span>
    <span class="toast-msg">${escHtml(message)}</span>
    <button class="toast-close" onclick="dismissToast(this.parentElement)" aria-label="Dismiss">✕</button>
  `;

  container.appendChild(div);

  const timer = setTimeout(() => dismissToast(div), duration);
  div._timer = timer;
}

function dismissToast(div) {
  if (!div || div._removing) return;
  div._removing = true;
  clearTimeout(div._timer);
  div.classList.add("removing");
  setTimeout(() => div.remove(), 320);
}

// ── FORM HELPERS ──────────────────────────────────────────────────────────────
function showFormErr(errEl, msg) {
  if (!errEl) return;
  errEl.textContent = msg;
  errEl.classList.remove("hidden");
}

function hideEl(elem) {
  if (elem) elem.classList.add("hidden");
}

function setText(id, text) {
  const elem = document.getElementById(id);
  if (elem) elem.textContent = text;
}

function resetBtnState(btn, label) {
  if (!btn) return;
  const labelEl = btn.querySelector(".btn-label");
  const spinEl = btn.querySelector(".btn-spin");
  if (labelEl) labelEl.textContent = label;
  if (spinEl) spinEl.classList.add("hidden");
  btn.disabled = false;
}

function setBtnLoading(btn, loading) {
  if (!btn) return;
  const spinEl = btn.querySelector(".btn-spin");
  if (spinEl) spinEl.classList.toggle("hidden", !loading);
  btn.disabled = loading;
}

// ── UTILITIES ─────────────────────────────────────────────────────────────────
function el(id) {
  return document.getElementById(id);
}

function fmtMoney(n) {
  if (n === null || n === undefined || isNaN(n)) return "$0";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)
    return "$" + (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "k";
  return "$" + Number(n).toLocaleString();
}

function fmtDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function getInitials(email) {
  if (!email) return "?";
  const parts = email.split("@")[0].split(/[.\-_]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

// Maps a product name to a relevant emoji icon
function productEmoji(name = "") {
  const n = name.toLowerCase();
  if (/laptop|macbook|notebook|pc|computer/.test(n)) return "💻";
  if (/phone|iphone|android|mobile/.test(n)) return "📱";
  if (/tablet|ipad/.test(n)) return "📟";
  if (/watch|clock/.test(n)) return "⌚";
  if (/headphone|earphone|airpod|audio/.test(n)) return "🎧";
  if (/camera|photo/.test(n)) return "📷";
  if (/tv|monitor|screen|display/.test(n)) return "🖥️";
  if (/shirt|cloth|dress|wear|shoe|boot/.test(n)) return "👕";
  if (/book|novel|guide|manual/.test(n)) return "📚";
  if (/food|snack|drink|coffee|tea|meal/.test(n)) return "🍔";
  if (/game|console|play/.test(n)) return "🎮";
  if (/car|vehicle|bike|motor/.test(n)) return "🚗";
  if (/tool|hammer|wrench|drill/.test(n)) return "🔧";
  if (/furniture|chair|desk|table|bed/.test(n)) return "🪑";
  if (/toy|doll|lego/.test(n)) return "🧸";
  return "📦";
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escAttr(str) {
  return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// ── EVENT LISTENERS ───────────────────────────────────────────────────────────
function initEvents() {
  // ── LOGIN FORM ──────────────────────────────────────────────
  el("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = el("login-email").value.trim();
    const password = el("login-password").value;
    const errEl = el("login-err");
    const submit = el("login-submit");

    if (!email || !password) {
      showFormErr(errEl, "Please enter your email and password.");
      return;
    }

    hideEl(errEl);
    setBtnLoading(submit, true);

    const res = await doLogin(email, password);
    setBtnLoading(submit, false);

    if (!res || !res.ok) {
      const msg = res?.data?.detail || "Invalid credentials. Please try again.";
      showFormErr(errEl, msg);
      return;
    }

    const token = res.data.access_token;
    const user = {
      id: res.data.user_id || null,
      email: res.data.email || email,
      created_at: res.data.created_at || null,
    };

    saveAuth(token, user);
    toast("Welcome back! 👋", "success");
    showApp();
  });

  // ── REGISTER FORM ────────────────────────────────────────────
  el("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = el("reg-email").value.trim();
    const password = el("reg-password").value;
    const confirm = el("reg-confirm").value;
    const errEl = el("register-err");
    const submit = el("register-submit");

    if (!email || !password) {
      showFormErr(errEl, "Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      showFormErr(errEl, "Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      showFormErr(errEl, "Passwords do not match.");
      el("reg-confirm").focus();
      return;
    }

    hideEl(errEl);
    setBtnLoading(submit, true);

    const res = await doRegister(email, password);
    setBtnLoading(submit, false);

    if (!res || !res.ok) {
      const detail = res?.data?.detail;
      let msg = "Registration failed. Please try again.";
      if (typeof detail === "string") msg = detail;
      else if (Array.isArray(detail)) msg = detail.map((d) => d.msg).join(". ");
      showFormErr(errEl, msg);
      return;
    }

    // Auto-login after register
    toast("Account created! Signing you in…", "success");
    const loginRes = await doLogin(email, password);

    if (loginRes && loginRes.ok) {
      const token = loginRes.data.access_token;
      const user = {
        id: loginRes.data.user_id || res.data.id || null,
        email: loginRes.data.email || email,
        created_at: loginRes.data.created_at || res.data.created_at || null,
      };
      saveAuth(token, user);
      showApp();
    } else {
      // Fallback: show login panel so user can sign in manually
      showPanel("login");
      el("login-email").value = email;
      toast("Account created! Please sign in.", "info");
    }
  });

  // ── PRODUCT FORM ─────────────────────────────────────────────
  el("product-form").addEventListener("submit", submitProductForm);

  // ── PASSWORD EYE BUTTONS ─────────────────────────────────────
  document.querySelectorAll(".eye-btn").forEach((btn) => {
    btn.addEventListener("click", () => togglePassword(btn.dataset.target));
  });

  // ── KEYBOARD: ESC closes modals ──────────────────────────────
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeProductModal();
      closeDeleteModal();
      closeSidebar();
    }
  });

  // ── KEYBOARD: Enter on search ────────────────────────────────
  const searchInput = el("search-input");
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") clearSearch();
    });
  }
}

// ── INIT ──────────────────────────────────────────────────────────────────────
function init() {
  // Apply saved view mode toggle button state
  const togGrid = el("tog-grid");
  const togList = el("tog-list");
  if (togGrid && togList) {
    togGrid.classList.toggle("active", state.viewMode === "grid");
    togList.classList.toggle("active", state.viewMode === "list");
  }

  initEvents();

  if (state.token && state.user) {
    showApp();
  } else {
    showAuth();
  }
}

// ── BOOTSTRAP ─────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", init);
