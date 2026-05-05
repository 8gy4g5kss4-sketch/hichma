
import { PRODUCTS } from './data.js';

let cart = [];
let currentPanelProduct = null;
let currentQty = 1;

/* ══════════════════════════════════════════════════════════
   RENDER PRODUCTS
══════════════════════════════════════════════════════════ */
function renderProducts(filter = 'all') {
  const grid = document.getElementById('productsGrid');
  const items = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);
  grid.innerHTML = items.map(p => `
    <div class="product-card reveal" data-cat="${p.cat}" onclick="openPanel(${p.id})">
      <div class="product-img-wrap">
        <img src="${p.img}" alt="${p.name}" loading="lazy"/>
        ${p.badge ? `<span class="product-badge ${p.badge}">${p.badgeLabel}</span>` : ''}
        ${p.stock ? `<div class="product-stock-bar">⚡ ${p.stockMsg}</div>` : ''}
        <button class="product-wish" onclick="event.stopPropagation();toggleWish(this)" aria-label="Wishlist">♡</button>
        <button class="product-quick-view">Quick View</button>
      </div>
      <div class="product-info">
        <div class="product-cat">${p.catLabel}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-meta">
          <div class="product-price">
            ${p.oldPrice ? `<s>$${p.oldPrice}</s>` : ''}$${p.price}
          </div>
          <div class="product-rating">
            <span class="product-stars">★★★★★</span>
            <span class="product-reviews">(${p.reviews})</span>
          </div>
        </div>
        <div class="product-colors">
          ${p.colors.map(c => `<span class="c-dot" style="background:${c}"></span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');

  // Re-run reveal observer on new elements
  grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

function filterProducts(cat, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(cat);
}

function toggleWish(btn) {
  const isWished = btn.classList.contains('liked');
  btn.textContent = isWished ? '♡' : '♥';
  btn.classList.toggle('liked', !isWished);
  if (!isWished) showToast('Added to wishlist ♥');
}

/* ══════════════════════════════════════════════════════════
   PANEL
══════════════════════════════════════════════════════════ */
function openPanel(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  currentPanelProduct = p;
  currentQty = 1;

  document.getElementById('panelImg').src = p.img;
  document.getElementById('panelImg').alt = p.name;
  document.getElementById('panelCat').textContent = p.catLabel;
  document.getElementById('panelName').textContent = p.name;
  document.getElementById('panelReviewCount').textContent = `(${p.reviews} reviews)`;
  document.getElementById('panelPrice').textContent = `$${p.price}`;
  const oldEl = document.getElementById('panelOld');
  oldEl.textContent = p.oldPrice ? `$${p.oldPrice}` : '';
  const saleEl = document.getElementById('panelSaleBadge');
  saleEl.textContent = p.oldPrice ? `${Math.round((1 - p.price/p.oldPrice)*100)}% OFF` : '';
  saleEl.style.display = p.oldPrice ? '' : 'none';
  const urgencyEl = document.getElementById('panelUrgency');
  if (p.stock) {
    urgencyEl.innerHTML = `🔥 ${p.stockMsg} in stock — selling fast`;
    urgencyEl.style.display = 'flex';
  } else {
    urgencyEl.style.display = 'none';
  }
  document.getElementById('panelDesc').textContent = p.fullDesc;
  document.getElementById('panelQty').textContent = 1;

  // Colors
  const colorsEl = document.getElementById('panelColors');
  colorsEl.innerHTML = p.colors.map((c, i) =>
    `<button class="panel-color${i===0?' active':''}" style="background:${c}" onclick="selectColor(this)" data-color="${c}"></button>`
  ).join('');

  // Sizes
  const sizesEl = document.getElementById('panelSizes');
  sizesEl.innerHTML = p.sizes.map((s, i) =>
    `<button class="panel-size${i===0?' active':''}" onclick="selectSize(this)">${s}</button>`
  ).join('');

  // WA link
  const waMsg = encodeURIComponent(`Hello! I'd like to order:\n\n*${p.name}* — $${p.price}\nColor: ${p.colors[0]}\nSize: ${p.sizes[0]}\nQty: 1\n\nCould you help me complete my order?`);
  document.getElementById('panelWALink').href = `https://wa.me/YOURPHONENUMBER?text=${waMsg}`;

  document.getElementById('productPanel').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePanel() {
  document.getElementById('productPanel').classList.remove('open');
  document.body.style.overflow = '';
}

function selectColor(btn) {
  document.querySelectorAll('#panelColors .panel-color').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
function selectSize(btn) {
  document.querySelectorAll('#panelSizes .panel-size').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
function changeQty(d) {
  currentQty = Math.max(1, Math.min(10, currentQty + d));
  document.getElementById('panelQty').textContent = currentQty;
}

/* ══════════════════════════════════════════════════════════
   CART
══════════════════════════════════════════════════════════ */
function addToCart() {
  if (!currentPanelProduct) return;
  const color = document.querySelector('#panelColors .panel-color.active')?.dataset.color || '';
  const size = document.querySelector('#panelSizes .panel-size.active')?.textContent || '';
  const existing = cart.find(i => i.id === currentPanelProduct.id && i.color === color && i.size === size);
  if (existing) {
    existing.qty += currentQty;
  } else {
    cart.push({ ...currentPanelProduct, qty: currentQty, color, size });
  }
  updateCart();
  closePanel();
  showToast(`✦ ${currentPanelProduct.name} added to your bag`);
  setTimeout(openCart, 600);
}

function updateCart() {
  const count = cart.reduce((a, i) => a + i.qty, 0);
  const total = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const countEl = document.getElementById('cartCount');
  countEl.textContent = count;
  countEl.classList.toggle('show', count > 0);

  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');

  if (cart.length === 0) {
    itemsEl.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon">🛍️</div><p>Your bag is empty.<br>Discover something beautiful.</p></div>';
    footerEl.style.display = 'none';
  } else {
    itemsEl.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <div class="cart-item-img"><img src="${item.img}" alt="${item.name}" loading="lazy"/></div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">${item.catLabel} · ${item.size} · <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.color};vertical-align:middle"></span></div>
          <div class="cart-item-footer">
            <div class="cart-item-price">$${(item.price * item.qty)}</div>
            <div class="cart-item-qty">
              <button onclick="updateQty(${idx},-1)">−</button>
              <span>${item.qty}</span>
              <button onclick="updateQty(${idx},1)">+</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
    footerEl.style.display = 'block';
    document.getElementById('cartTotal').textContent = `$${total}`;
    const items = cart.map(i => `• ${i.name} (${i.size}) ×${i.qty} — $${i.price * i.qty}`).join('%0A');
    const waMsg = encodeURIComponent(`Hello! I'd like to order:\n\n${cart.map(i => `• ${i.name} (${i.size}) ×${i.qty} — $${i.price*i.qty}`).join('\n')}\n\nTotal: $${total}\n\nPlease help me complete my order!`);
    document.getElementById('cartWALink').href = `https://wa.me/YOURPHONENUMBER?text=${waMsg}`;
  }
}

function updateQty(idx, d) {
  cart[idx].qty = Math.max(0, cart[idx].qty + d);
  if (cart[idx].qty === 0) cart.splice(idx, 1);
  updateCart();
}

function openCart() {
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ══════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════ */
let toastTimeout;
function showToast(msg, duration = 4000) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => t.classList.remove('show'), duration);
}

/* ══════════════════════════════════════════════════════════
   FAQ
══════════════════════════════════════════════════════════ */
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

/* ══════════════════════════════════════════════════════════
   EMAIL CAPTURE
══════════════════════════════════════════════════════════ */
function handleCapture() {
  const name = document.getElementById('captureName').value.trim();
  const email = document.getElementById('captureEmail').value.trim();
  if (!name) { showToast('Please enter your name.'); return; }
  if (!email || !email.includes('@')) { showToast('Please enter a valid email.'); return; }
  const btn = document.getElementById('captureBtn');
  btn.disabled = true; btn.textContent = 'Saving...';
  setTimeout(() => {
    document.getElementById('captureForm').innerHTML = `
      <div style="text-align:center;padding:2rem 1rem">
        <div style="font-size:3rem;margin-bottom:1rem">🌸</div>
        <div style="font-family:var(--serif);font-size:2rem;font-weight:400;color:var(--charcoal);margin-bottom:0.6rem">Welcome, ${name}!</div>
        <p style="color:var(--sand);font-size:0.9rem;font-weight:300;line-height:1.8;max-width:360px;margin:0 auto 1.5rem">Your <strong>10% discount code</strong> is on its way to <strong>${email}</strong>. Check your inbox. ✨</p>
        <a href="https://wa.me/YOURPHONENUMBER?text=Hello!%20I%20just%20signed%20up%20and%20I%27m%20ready%20to%20order!" target="_blank" style="display:inline-flex;align-items:center;gap:0.5rem;background:var(--wa);color:#fff;padding:0.9rem 2rem;font-size:0.78rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;border-radius:2px;text-decoration:none">
          Order Now on WhatsApp →
        </a>
      </div>`;
    showToast(`🎉 Welcome, ${name}! Check your inbox for your code.`);
  }, 1000);
}

/* ══════════════════════════════════════════════════════════
   NAV
══════════════════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
});

function toggleMobileNav() {
  document.getElementById('mobileNav').classList.toggle('open');
}

function scrollToShowroom() {
  document.getElementById('showroom').scrollIntoView({ behavior: 'smooth' });
}

/* ══════════════════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ══════════════════════════════════════════════════════════
   3D SHOWROOM — Three.js
══════════════════════════════════════════════════════════ */
function initShowroom() {
  const canvas = document.getElementById('showroom-canvas');
  if (!canvas || !window.THREE) return;

  const W = canvas.clientWidth, H = canvas.clientHeight;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x161310);
  scene.fog = new THREE.Fog(0x161310, 15, 35);

  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
  camera.position.set(0, 2.5, 9);

  /* ── LIGHTS ── */
  const ambient = new THREE.AmbientLight(0xfff8f0, 0.4);
  scene.add(ambient);

  // Warm key light (simulates chandelier)
  const keyLight = new THREE.PointLight(0xfff0d0, 3, 20);
  keyLight.position.set(0, 8, 0);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.radius = 6;
  scene.add(keyLight);

  // Fill lights — warm rose/gold from sides
  const fillL = new THREE.PointLight(0xffe0c0, 1.5, 15);
  fillL.position.set(-6, 3, 2);
  scene.add(fillL);

  const fillR = new THREE.PointLight(0xffd0a0, 1.5, 15);
  fillR.position.set(6, 3, 2);
  scene.add(fillR);

  // Accent spotlights on mannequins
  const spotColors = [0xffeedd, 0xfff0e0, 0xffe8d0];
  spotColors.forEach((c, i) => {
    const spot = new THREE.SpotLight(c, 4, 20, Math.PI / 8, 0.3);
    spot.position.set(-4 + i * 4, 7, 1);
    spot.target.position.set(-4 + i * 4, 0, 0);
    spot.castShadow = true;
    spot.shadow.mapSize.set(512, 512);
    scene.add(spot);
    scene.add(spot.target);
  });

  /* ── FLOOR ── */
  const floorGeo = new THREE.PlaneGeometry(30, 30);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1a1612,
    roughness: 0.1,
    metalness: 0.05,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.5;
  floor.receiveShadow = true;
  scene.add(floor);

  // Floor reflection plane
  const reflGeo = new THREE.PlaneGeometry(30, 30);
  const reflMat = new THREE.MeshStandardMaterial({
    color: 0x1e1814,
    roughness: 0.05,
    metalness: 0.3,
    transparent: true,
    opacity: 0.6,
  });
  const refl = new THREE.Mesh(reflGeo, reflMat);
  refl.rotation.x = -Math.PI / 2;
  refl.position.y = -0.49;
  scene.add(refl);

  /* ── WALLS ── */
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x1c1814, roughness: 0.8, metalness: 0.0 });
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), wallMat);
  backWall.position.set(0, 6.5, -8);
  scene.add(backWall);

  /* ── ARCH / FRAME decorations ── */
  const moldingMat = new THREE.MeshStandardMaterial({ color: 0xc8a55e, roughness: 0.3, metalness: 0.6 });

  // Base plinth arch shapes
  [-8, 0, 8].forEach(x => {
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.06, 8, 24, Math.PI),
      moldingMat
    );
    arch.position.set(x, 4.2, -7.9);
    arch.rotation.z = Math.PI;
    scene.add(arch);

    const stem1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.2, 8), moldingMat);
    stem1.position.set(x - 1.5, 2.1, -7.9);
    scene.add(stem1);
    const stem2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.2, 8), moldingMat);
    stem2.position.set(x + 1.5, 2.1, -7.9);
    scene.add(stem2);
  });

  /* ── CHANDELIER ── */
  const chandMat = new THREE.MeshStandardMaterial({ color: 0xd4b06a, roughness: 0.1, metalness: 0.9, emissive: 0xffd090, emissiveIntensity: 0.2 });
  const chandPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 3, 8), chandMat);
  chandPole.position.set(0, 9, 0);
  scene.add(chandPole);
  const chandBase = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), chandMat);
  chandBase.position.set(0, 7.5, 0);
  scene.add(chandBase);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.2, 6), chandMat);
    arm.position.set(Math.cos(a) * 0.8, 7.3, Math.sin(a) * 0.8);
    arm.rotation.z = Math.PI / 5 * Math.sign(Math.cos(a));
    scene.add(arm);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshStandardMaterial({ color: 0xfffde0, emissive: 0xfffde0, emissiveIntensity: 3 }));
    bulb.position.set(Math.cos(a) * 0.8, 6.8, Math.sin(a) * 0.8);
    scene.add(bulb);
  }

  /* ── DRESS FORMS (mannequins) ── */
  const dressColors = [0xc8a090, 0xd4b4a0, 0xbea090];
  const gownColors = [0x2a2420, 0xc4957a, 0xe8ddd0];
  const gownNames = ['Al Noor Silk Abaya', 'Qamar Silk Hijab Set', 'Fajr Linen Co-ord'];
  const gownPrices = ['$285', '$145', '$340'];
  const gownIds = [1, 5, 3];

  const mannequins = [];

  [-4, 0, 4].forEach((x, idx) => {
    const group = new THREE.Group();

    // Torso
    const torsoGeo = new THREE.CylinderGeometry(0.32, 0.42, 1.5, 16);
    const torsoMat = new THREE.MeshStandardMaterial({ color: dressColors[idx], roughness: 0.6, metalness: 0.1 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.5;
    torso.castShadow = true;
    group.add(torso);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 0.25, 12), torsoMat);
    neck.position.y = 2.35;
    group.add(neck);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8), torsoMat);
    head.position.y = 2.65;
    head.scale.set(1, 1.1, 0.9);
    group.add(head);

    // Stand pole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8), new THREE.MeshStandardMaterial({ color: 0x8a7060, metalness: 0.4, roughness: 0.4 }));
    pole.position.y = 0.15;
    group.add(pole);

    // Base disk
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.06, 24), new THREE.MeshStandardMaterial({ color: 0x3a2e28, metalness: 0.3, roughness: 0.5 }));
    base.position.y = -0.22;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // GOWN (simplified dress)
    const gownGeo = new THREE.CylinderGeometry(0.55, 1.05, 2.8, 20, 4, true);
    const gownMat = new THREE.MeshStandardMaterial({
      color: gownColors[idx], roughness: 0.85, metalness: 0,
      side: THREE.FrontSide, transparent: true, opacity: 0.97
    });
    const gown = new THREE.Mesh(gownGeo, gownMat);
    gown.position.y = 0.35;
    gown.castShadow = true;
    group.add(gown);

    // Label card
    const cardGeo = new THREE.BoxGeometry(1.2, 0.4, 0.02);
    const cardMat = new THREE.MeshStandardMaterial({ color: 0xf8f4ef, roughness: 0.8 });
    const card = new THREE.Mesh(cardGeo, cardMat);
    card.position.set(0, -0.06, 0.7);
    group.add(card);

    // Gold trim
    const trim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.008, 6, 24), new THREE.MeshStandardMaterial({ color: 0xc8a55e, metalness: 0.8, roughness: 0.2 }));
    trim.position.y = 2.22;
    trim.rotation.x = Math.PI / 2;
    group.add(trim);

    group.position.set(x, -0.3, -1);
    group.userData = { productId: gownIds[idx], name: gownNames[idx], price: gownPrices[idx], baseX: x };
    scene.add(group);
    mannequins.push(group);
  });

  /* ── PARTICLES (floating dust motes) ── */
  const pGeo = new THREE.BufferGeometry();
  const pCount = 120;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * 20;
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xc8a55e, size: 0.04, transparent: true, opacity: 0.5 });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  /* ── ORBIT CONTROLS (simple, native) ── */
  let isDragging = false, lastX = 0, camTheta = 0;
  let targetTheta = 0, targetY = 2.5;

  canvas.addEventListener('mousedown', e => { isDragging = true; lastX = e.clientX; });
  window.addEventListener('mouseup', () => isDragging = false);
  canvas.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    targetTheta -= dx * 0.008;
  });
  canvas.addEventListener('touchstart', e => { isDragging = true; lastX = e.touches[0].clientX; }, { passive: true });
  window.addEventListener('touchend', () => isDragging = false);
  canvas.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - lastX;
    lastX = e.touches[0].clientX;
    targetTheta -= dx * 0.008;
  }, { passive: true });

  /* ── HOVER / CLICK detection ── */
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredMannequin = null;

  function getMannequinAt(event) {
    const rect = canvas.getBoundingClientRect();
    const cx = event.clientX ?? (event.touches?.[0]?.clientX);
    const cy = event.clientY ?? (event.touches?.[0]?.clientY);
    mouse.x = ((cx - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((cy - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const objects = mannequins.flatMap(m => m.children);
    const hits = raycaster.intersectObjects(objects, false);
    if (!hits.length) return null;
    return mannequins.find(m => m.children.includes(hits[0].object));
  }

  canvas.addEventListener('mousemove', e => {
    const m = getMannequinAt(e);
    if (m !== hoveredMannequin) {
      hoveredMannequin = m;
      canvas.style.cursor = m ? 'pointer' : 'grab';
    }
  });

  canvas.addEventListener('click', e => {
    if (isDragging) return;
    const m = getMannequinAt(e);
    if (m?.userData?.productId) openPanel(m.userData.productId);
  });

  /* ── RESIZE ── */
  function onResize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);

  /* ── ANIMATION LOOP ── */
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.01;

    // Smooth camera orbit
    camTheta += (targetTheta - camTheta) * 0.06;
    const r = 9;
    camera.position.x = Math.sin(camTheta) * r;
    camera.position.z = Math.cos(camTheta) * r;
    camera.lookAt(0, 1.5, 0);

    // Chandelier sway
    keyLight.position.x = Math.sin(t * 0.3) * 0.5;

    // Mannequin gentle breathing
    mannequins.forEach((m, i) => {
      const hover = m === hoveredMannequin;
      const targetScale = hover ? 1.04 : 1.0;
      m.scale.y += (targetScale - m.scale.y) * 0.08;
      m.scale.x += (targetScale - m.scale.x) * 0.08;

      // Subtle floating
      m.position.y = -0.3 + Math.sin(t * 0.5 + i * 1.2) * 0.03;

      // Gown shimmer
      if (hover) {
        m.children.forEach(c => {
          if (c.material?.emissiveIntensity !== undefined) c.material.emissiveIntensity = 0.15;
        });
      }
    });

    // Particle drift
    particles.rotation.y += 0.0005;
    particles.rotation.x += 0.0002;

    renderer.render(scene, camera);
  }
  animate();
}

/* ══════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCart();
  initShowroom();
});
// Keyboard close
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closePanel(); closeCart(); }
});
