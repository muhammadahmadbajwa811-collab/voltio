/* Voltio store: shared layout, cart and page logic */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => "$" + n.toFixed(2);
const getP = id => PRODUCTS.find(p => p.id === Number(id));
const page = document.body.dataset.page;
const label = k => k.replace(/_/g, " ");

/* ---------- Cart storage ---------- */
const loadCart = () => { try { return JSON.parse(localStorage.getItem("voltio-cart")) || []; } catch (e) { return []; } };
const saveCart = c => { try { localStorage.setItem("voltio-cart", JSON.stringify(c)); } catch (e) {} updateBadge(); };
const getPromo = () => { try { return sessionStorage.getItem("voltio-promo"); } catch (e) { return null; } };
function totals() {
  const cart = loadCart();
  const sub = cart.reduce((s, i) => s + i.qty * getP(i.id).price, 0);
  const disc = getPromo() === "VOLT10" ? sub * 0.1 : 0;
  const ship = sub === 0 || sub - disc >= 100 ? 0 : 8;
  return { cart, sub, disc, ship, total: sub - disc + ship, count: cart.reduce((s, i) => s + i.qty, 0) };
}
function addToCart(id, qty = 1) {
  const p = getP(id); if (!p || p.stock <= 0) return;
  const cart = loadCart(), item = cart.find(i => i.id === p.id);
  const have = item ? item.qty : 0;
  if (have + qty > p.stock) return toast(`Only ${p.stock} of ${p.name} in stock`);
  item ? item.qty += qty : cart.push({ id: p.id, qty });
  saveCart(cart);
  toast(`${p.name} added to cart`);
}
function updateBadge() {
  const el = $("#cartCount"); if (!el) return;
  el.textContent = totals().count;
  el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump");
}
let tt;
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 2400);
}

/* ---------- Shared pieces ---------- */
const stars = r => `<span class="stars" aria-label="${r} out of 5">${"★".repeat(Math.round(r))}${"☆".repeat(5 - Math.round(r))}</span>`;
function card(p) {
  const out = p.stock <= 0;
  return `<article class="card">
    <a href="product.html?id=${p.id}" class="card-img">
      <img src="images/${p.img}.svg" alt="${p.name}" loading="lazy">
      ${out ? `<span class="tag dark">Sold out</span>` : p.tag ? `<span class="tag">${p.tag}</span>` : ""}
    </a>
    <div class="card-body">
      <span class="cat">${CATEGORIES[p.category]}</span>
      <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
      <div class="rate">${stars(p.rating)} <span>${p.rating} (${p.reviews})</span></div>
      <div class="card-foot">
        <span class="price">$${p.price}${p.old ? `<s>$${p.old}</s>` : ""}</span>
        <button class="add" data-add="${p.id}" ${out ? "disabled" : ""}>${out ? "Sold out" : "Add to cart"}</button>
      </div>
    </div></article>`;
}
const grid = (el, list) => { el.innerHTML = list.map(card).join(""); };

function layout() {
  const nav = [["index.html", "Home", "home"], ["shop.html", "Shop", "shop"], ["about.html", "About", "about"], ["contact.html", "Contact", "contact"]];
  $("#site-header").innerHTML = `
  <div class="topbar">Free delivery on orders over $100 &nbsp;|&nbsp; Use code <b>VOLT10</b> for 10% off</div>
  <header class="nav"><div class="container nav-inner">
    <a href="index.html" class="brand"><img src="images/logo.svg" alt="" width="36" height="36"><span>Voltio</span></a>
    <nav id="menu" class="menu" aria-label="Main">${nav.map(n => `<a href="${n[0]}" class="${page === n[2] ? "active" : ""}">${n[1]}</a>`).join("")}</nav>
    <form class="search" action="shop.html" role="search">
      <input type="search" name="q" id="hq" placeholder="Search products" aria-label="Search products" autocomplete="off">
    </form>
    <div class="nav-actions">
      <a href="cart.html" class="cart-btn" aria-label="Cart">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h8.1a2 2 0 0 0 2-1.5L21 8H6"/></svg>
        <span class="cart-count" id="cartCount">0</span></a>
      <button class="burger" id="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
    </div></div></header>`;
  const cats = Object.entries(CATEGORIES).map(([k, v]) => `<a href="shop.html?cat=${k}">${v}</a>`).join("");
  $("#site-footer").innerHTML = `
  <section class="newsletter"><div class="container nl-inner">
    <div><h3>Get deals in your inbox</h3><p>New arrivals and offers, once a week. No spam.</p></div>
    <form id="nlForm" class="nl-form"><input type="email" required placeholder="Your email address" aria-label="Email address"><button class="btn btn-primary">Subscribe</button></form>
  </div></section>
  <footer class="footer"><div class="container footer-grid">
    <div><a href="index.html" class="brand light"><img src="images/logo.svg" alt="" width="36" height="36"><span>Voltio</span></a>
      <p>Everyday electronics at honest prices, delivered to your door.</p></div>
    <div><h4>Shop</h4>${cats}</div>
    <div><h4>Help</h4><a href="contact.html#faq">Shipping and delivery</a><a href="contact.html#faq">Returns and refunds</a><a href="contact.html#faq">Warranty</a><a href="contact.html">Contact us</a></div>
    <div><h4>Visit us</h4><p>12 Mall Road, Lahore, Pakistan</p><p>Mon to Sat, 10am to 8pm</p><p>hello@voltio.example</p><p>+92 300 0000000</p>
      <div class="social">
        <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M14 8V6.5c0-.7.3-1 1-1h2V2h-3c-3 0-4.5 1.8-4.5 4.4V8H7v3.5h2.5V22H14V11.5h2.8L17.3 8z"/></svg></a>
        <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a>
        <a href="#" aria-label="X"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.8 3h3L14.2 10.5 22 21h-6.1l-4.8-6.3L5.6 21h-3l7-8L2.2 3h6.2l4.3 5.8zm-1 16.2h1.7L7.4 4.7H5.6z"/></svg></a>
        <a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3z"/></svg></a>
      </div></div>
  </div><p class="copy">&copy; 2026 Voltio. Student project, not a real store.</p></footer>`;

  $("#burger").onclick = e => { const o = $("#menu").classList.toggle("open"); e.currentTarget.setAttribute("aria-expanded", o); };
  $("#nlForm").onsubmit = e => { e.preventDefault(); e.target.reset(); toast("Thanks for subscribing!"); };
  document.addEventListener("click", e => { const b = e.target.closest("[data-add]"); if (b) addToCart(b.dataset.add); });
  updateBadge();
}

/* ---------- Home ---------- */
function home() {
  $("#catTiles").innerHTML = Object.entries(CATEGORIES).map(([k, v]) => {
    const p = PRODUCTS.find(x => x.category === k), n = PRODUCTS.filter(x => x.category === k).length;
    return `<a class="tile" href="shop.html?cat=${k}"><img src="images/${p.img}.svg" alt=""><div><h3>${v}</h3><span>${n} product${n > 1 ? "s" : ""}</span></div></a>`;
  }).join("");
  grid($("#featured"), [...PRODUCTS].sort((a, b) => b.reviews - a.reviews).slice(0, 4));
  grid($("#newest"), PRODUCTS.filter(p => p.tag === "New" || p.old).slice(0, 4));
}

/* ---------- Shop ---------- */
function shop() {
  const qs = new URLSearchParams(location.search);
  const st = { cat: CATEGORIES[qs.get("cat")] ? qs.get("cat") : "all", q: qs.get("q") || "", sort: "default", max: 1000, stock: false };
  $("#hq").value = st.q;
  const catList = $("#catList");
  const draw = () => {
    catList.innerHTML = [["all", "All products", PRODUCTS.length], ...Object.entries(CATEGORIES).map(([k, v]) => [k, v, PRODUCTS.filter(p => p.category === k).length])]
      .map(([k, v, n]) => `<label class="opt"><input type="radio" name="cat" value="${k}" ${st.cat === k ? "checked" : ""}> ${v} <span>${n}</span></label>`).join("");
  };
  const render = () => {
    let list = PRODUCTS.filter(p => (st.cat === "all" || p.category === st.cat) && p.price <= st.max && (!st.stock || p.stock > 0) &&
      (p.name + " " + p.brand + " " + CATEGORIES[p.category]).toLowerCase().includes(st.q.toLowerCase().trim()));
    if (st.sort === "low") list.sort((a, b) => a.price - b.price);
    if (st.sort === "high") list.sort((a, b) => b.price - a.price);
    if (st.sort === "rating") list.sort((a, b) => b.rating - a.rating);
    grid($("#productGrid"), list);
    $("#empty").hidden = list.length > 0;
    $("#count").textContent = `${list.length} product${list.length === 1 ? "" : "s"}` + (st.cat !== "all" ? ` in ${CATEGORIES[st.cat]}` : "") + (st.q ? ` for "${st.q}"` : "");
    $("#title").textContent = st.cat === "all" ? "All products" : CATEGORIES[st.cat];
  };
  draw(); render();
  catList.onchange = e => { st.cat = e.target.value; render(); };
  $("#sort").onchange = e => { st.sort = e.target.value; render(); };
  $("#price").oninput = e => { st.max = +e.target.value; $("#priceVal").textContent = "$" + st.max; render(); };
  $("#stock").onchange = e => { st.stock = e.target.checked; render(); };
  $("#hq").oninput = e => { st.q = e.target.value; render(); };
  $(".search").onsubmit = e => e.preventDefault();
  $("#reset").onclick = () => { st.cat = "all"; st.q = ""; st.max = 1000; st.stock = false; st.sort = "default"; $("#hq").value = ""; $("#price").value = 1000; $("#priceVal").textContent = "$1000"; $("#stock").checked = false; $("#sort").value = "default"; draw(); render(); };
  $("#filterBtn").onclick = () => $("#sidebar").classList.toggle("open");
}

/* ---------- Product ---------- */
function product() {
  const p = getP(new URLSearchParams(location.search).get("id"));
  const root = $("#pdp");
  if (!p) { root.innerHTML = `<div class="notice"><h2>Product not found</h2><p>That product doesn't exist or was removed.</p><a class="btn btn-blue" href="shop.html">Back to shop</a></div>`; return; }
  document.title = `${p.name} | Voltio`;
  const out = p.stock <= 0, low = p.stock > 0 && p.stock <= 6;
  const revs = [0, 1, 2].map(i => REVIEW_POOL[(p.id + i) % REVIEW_POOL.length]);
  const save = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
  $("#crumbs").innerHTML = `<a href="index.html">Home</a> / <a href="shop.html">Shop</a> / <a href="shop.html?cat=${p.category}">${CATEGORIES[p.category]}</a> / <span>${p.name}</span>`;
  root.innerHTML = `
  <div class="pdp-img"><img src="images/${p.img}.svg" alt="${p.name}">${p.tag ? `<span class="tag">${p.tag}</span>` : ""}</div>
  <div class="pdp-info">
    <span class="cat">${p.brand} &middot; ${CATEGORIES[p.category]}</span>
    <h1>${p.name}</h1>
    <div class="rate">${stars(p.rating)} <a href="#reviews" data-tab-link="reviews">${p.rating} (${p.reviews} reviews)</a></div>
    <div class="pdp-price"><span class="price">$${p.price}</span>${p.old ? `<s>$${p.old}</s><b class="save">Save ${save}%</b>` : ""}</div>
    <p class="stock ${out ? "out" : low ? "low" : "in"}">${out ? "Out of stock" : low ? `Only ${p.stock} left in stock` : "In stock, ready to ship"}</p>
    <p>${p.short}</p>
    <ul class="ticks">${p.features.map(f => `<li>${f}</li>`).join("")}</ul>
    <div class="buy">
      <div class="qty-box"><button id="minus" aria-label="Decrease">−</button><input id="qty" type="number" min="1" max="${Math.max(p.stock, 1)}" value="1" aria-label="Quantity"><button id="plus" aria-label="Increase">+</button></div>
      <button class="btn btn-blue" id="addBtn" ${out ? "disabled" : ""}>${out ? "Out of stock" : "Add to cart"}</button>
      <button class="btn btn-dark" id="buyNow" ${out ? "disabled" : ""}>Buy now</button>
    </div>
    <div class="perks"><span>Free delivery over $100</span><span>30-day returns</span><span>1-year warranty</span></div>
  </div>`;
  $("#tabPanels").innerHTML = `
    <div class="panel" id="p-description"><h3>About this product</h3><p>${p.long}</p></div>
    <div class="panel" id="p-specs" hidden><h3>Technical specifications</h3><table class="specs">${Object.entries(p.specs).map(([k, v]) => `<tr><th>${label(k)}</th><td>${v}</td></tr>`).join("")}</table></div>
    <div class="panel" id="p-reviews" hidden><h3>Customer reviews</h3><div class="sum"><b>${p.rating}</b>${stars(p.rating)}<span>Based on ${p.reviews} reviews</span></div>
      ${revs.map(r => `<div class="review"><div><b>${r.n}</b> ${stars(r.r)}</div><p>${r.t}</p><small>Verified buyer</small></div>`).join("")}</div>`;
  const tab = name => { $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === name)); $$(".panel").forEach(x => x.hidden = x.id !== "p-" + name); };
  $$(".tab").forEach(t => t.onclick = () => tab(t.dataset.tab));
  $("[data-tab-link]").onclick = () => tab("reviews");

  const qty = $("#qty"), clamp = () => { qty.value = Math.min(Math.max(+qty.value || 1, 1), Math.max(p.stock, 1)); return +qty.value; };
  $("#minus").onclick = () => { qty.value = +qty.value - 1; clamp(); };
  $("#plus").onclick = () => { qty.value = +qty.value + 1; clamp(); };
  qty.onchange = clamp;
  $("#addBtn").onclick = () => addToCart(p.id, clamp());
  $("#buyNow").onclick = () => { addToCart(p.id, clamp()); location.href = "checkout.html"; };
  grid($("#related"), PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).concat(PRODUCTS.filter(x => x.category !== p.category && x.id !== p.id)).slice(0, 4));
}

/* ---------- Order summary (cart + checkout) ---------- */
function summary(el, withBtn) {
  const t = totals();
  el.innerHTML = `<h3>Order summary</h3>
    <div class="row"><span>Subtotal (${t.count} item${t.count === 1 ? "" : "s"})</span><span>${money(t.sub)}</span></div>
    ${t.disc ? `<div class="row green"><span>Discount (VOLT10)</span><span>−${money(t.disc)}</span></div>` : ""}
    <div class="row"><span>Shipping</span><span>${t.ship ? money(t.ship) : "Free"}</span></div>
    <div class="row total"><span>Total</span><span>${money(t.total)}</span></div>
    ${t.sub && t.sub - t.disc < 100 ? `<p class="hint">Add ${money(100 - t.sub + t.disc)} more for free delivery.</p>` : ""}
    ${withBtn ? `<a class="btn btn-blue full ${t.count ? "" : "disabled"}" href="checkout.html">Proceed to checkout</a>` : ""}`;
}

/* ---------- Cart ---------- */
function cartPage() {
  const draw = () => {
    const { cart } = totals();
    $("#cartBody").innerHTML = cart.length ? cart.map(i => {
      const p = getP(i.id);
      return `<div class="line"><a href="product.html?id=${p.id}"><img src="images/${p.img}.svg" alt="${p.name}"></a>
        <div class="li"><a href="product.html?id=${p.id}"><h4>${p.name}</h4></a><span class="muted">${money(p.price)} each</span>
          <div class="qty-box sm"><button data-act="dec" data-id="${p.id}" aria-label="Decrease">−</button><span>${i.qty}</span><button data-act="inc" data-id="${p.id}" aria-label="Increase">+</button></div></div>
        <div class="lt"><b>${money(p.price * i.qty)}</b><button class="rm" data-act="rm" data-id="${p.id}">Remove</button></div></div>`;
    }).join("") : `<div class="notice"><h2>Your cart is empty</h2><p>Find something you like in the shop.</p><a class="btn btn-blue" href="shop.html">Start shopping</a></div>`;
    summary($("#summary"), true);
    $("#promoNote").textContent = getPromo() ? "Code VOLT10 applied: 10% off." : "";
    updateBadge();
  };
  draw();
  $("#cartBody").onclick = e => {
    const b = e.target.closest("button"); if (!b) return;
    let cart = loadCart(); const it = cart.find(i => i.id === +b.dataset.id), p = getP(it.id);
    if (b.dataset.act === "inc") { if (it.qty >= p.stock) return toast(`Only ${p.stock} in stock`); it.qty++; }
    if (b.dataset.act === "dec") it.qty--;
    if (b.dataset.act === "rm" || it.qty <= 0) cart = cart.filter(i => i.id !== it.id);
    saveCart(cart); draw();
  };
  $("#promoForm").onsubmit = e => {
    e.preventDefault();
    const v = $("#promo").value.trim().toUpperCase();
    if (v === "VOLT10") { sessionStorage.setItem("voltio-promo", v); toast("Promo code applied"); }
    else toast("That code isn't valid");
    draw();
  };
}

/* ---------- Checkout ---------- */
function checkout() {
  const t = totals();
  if (!t.count) { $("#checkoutWrap").innerHTML = `<div class="notice"><h2>Your cart is empty</h2><p>Add some products before checking out.</p><a class="btn btn-blue" href="shop.html">Go to shop</a></div>`; return; }
  const draw = () => {
    summary($("#summary"), false);
    $("#miniItems").innerHTML = totals().cart.map(i => { const p = getP(i.id); return `<div class="mini"><img src="images/${p.img}.svg" alt=""><span>${p.name} × ${i.qty}</span><b>${money(p.price * i.qty)}</b></div>`; }).join("");
  };
  draw();
  $("#checkoutForm").onsubmit = e => {
    e.preventDefault();
    const f = e.target;
    if (!f.checkValidity()) return f.reportValidity();
    const d = totals(), data = Object.fromEntries(new FormData(f));
    const order = { id: "VT-" + Math.floor(100000 + Math.random() * 900000), name: data.name, email: data.email, city: data.city, address: data.address, payment: data.payment,
      items: d.cart.map(i => ({ name: getP(i.id).name, qty: i.qty, price: getP(i.id).price })), total: d.total, date: new Date().toLocaleString() };
    try { const o = JSON.parse(localStorage.getItem("voltio-orders")) || []; o.push(order); localStorage.setItem("voltio-orders", JSON.stringify(o)); } catch (x) {}
    saveCart([]); try { sessionStorage.removeItem("voltio-promo"); } catch (x) {}
    const pay = { cod: "Cash on delivery", bank: "Bank transfer", card: "Card (demo)" }[order.payment];
    $("#checkoutWrap").innerHTML = `<div class="success"><div class="check">✓</div><h2>Thank you, ${order.name.split(" ")[0]}!</h2>
      <p>Your order <b>${order.id}</b> has been placed. We sent a confirmation to ${order.email}.</p>
      <div class="box"><div class="row"><span>Deliver to</span><span>${order.address}, ${order.city}</span></div><div class="row"><span>Payment</span><span>${pay}</span></div>
      ${order.items.map(i => `<div class="row"><span>${i.name} × ${i.qty}</span><span>${money(i.price * i.qty)}</span></div>`).join("")}
      <div class="row total"><span>Total</span><span>${money(order.total)}</span></div></div>
      <p class="muted">Estimated delivery: 2 to 4 working days. This is a demo store, so no real order or payment was made.</p>
      <a class="btn btn-blue" href="shop.html">Continue shopping</a></div>`;
    scrollTo({ top: 0, behavior: "smooth" });
  };
}

/* ---------- Contact ---------- */
function contact() {
  $("#contactForm").onsubmit = e => {
    e.preventDefault();
    if (!e.target.checkValidity()) return e.target.reportValidity();
    e.target.reset(); toast("Message sent. We'll reply within one working day.");
  };
}

/* ---------- Init ---------- */
layout();
({ home, shop, product, cart: cartPage, checkout, contact }[page] || (() => {}))();
