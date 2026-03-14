/* ═══════════════════════════════════════════════════════════
   ProtIN — D2C Store Engine v2.0
   ═══════════════════════════════════════════════════════════ */

const products=[
  {id:1,name:'Protein Laddoo',sub:'6 pack · Sattu · Peanut · Jaggery · Almonds',desc:'Traditional Indian laddoo reinvented with high protein ingredients. No sugar, no preservatives.',price:199,mrp:320,protein:10,icon:'🫓',bg:'#FEF3E2',badge:'Bestseller',unit:'per laddoo',
   ingredients:['Sattu (roasted gram flour)','Peanuts','Jaggery','Almonds','Ghee','Cardamom'],
   source:'Sattu from Bihar, Peanuts from Gujarat, Jaggery from Maharashtra'},
  {id:2,name:'Millet Energy Bar',sub:'Single bar · Ragi · Jowar · Peanuts · Seeds',desc:'Made with ancient Indian grains. Perfect pre-workout or evening snack.',price:89,mrp:140,protein:12,icon:'🌾',bg:'#EBF5E1',badge:'Trending',unit:'per bar',
   ingredients:['Ragi (finger millet)','Jowar (sorghum)','Peanuts','Pumpkin seeds','Jaggery','Flaxseeds'],
   source:'Ragi from Karnataka, Jowar from Rajasthan'},
  {id:3,name:'Roasted Snack Mix',sub:'200g · Chana · Peanuts · Soy Nuts · Spices',desc:'Highest protein snack in our range. Zero cooking, just roasted goodness.',price:149,mrp:230,protein:17,icon:'🥜',bg:'#FBF4E8',badge:'High Protein',unit:'per serving',
   ingredients:['Roasted chana','Peanuts','Soy nuts','Black pepper','Rock salt','Turmeric'],
   source:'Chana from MP, Peanuts from Gujarat'},
  {id:4,name:'Desi Peanut Butter',sub:'250g · Pure Peanuts · Jaggery · No additives',desc:'No palm oil. No emulsifiers. Just crushed peanuts with jaggery powder.',price:249,mrp:380,protein:25,icon:'🥄',bg:'#FEF3E2',badge:'25g Protein',unit:'per 100g',
   ingredients:['Roasted peanuts (95%)','Jaggery powder (5%)','No palm oil','No emulsifiers'],
   source:'Peanuts from Gujarat, Jaggery from Maharashtra'},
];

let cart={};
let bundle={};
let loyaltyPoints=parseInt(localStorage.getItem('dp_loyalty')||'0');
let challengeDay=parseInt(localStorage.getItem('dp_challenge')||'0');
let challengeActive=localStorage.getItem('dp_challenge_active')==='true';

/* ═══════════════ SHOP ═══════════════ */
function renderShop(){
  const g=document.getElementById('prod-grid');
  if(!g)return;
  g.innerHTML=products.map(p=>{
    const sv=Math.round((1-p.price/p.mrp)*100);
    const barW=Math.min(100,p.protein*3.5);
    const inCart=cart[p.id]>0;
    return`<div class="pcard">
      <div class="pcard-img" style="background:${p.bg}">
        <span style="font-size:54px">${p.icon}</span>
        <div class="pcard-badge">${p.badge}</div>
        <div class="pcard-badge2">${sv}% off</div>
      </div>
      <div class="pcard-body">
        <div class="pcard-name">${p.name}</div>
        <div class="pcard-desc">${p.sub}</div>
        <div class="pcard-desc" style="margin-bottom:10px">${p.desc}</div>
        <button class="ingr-btn" onclick="showIngredients(${p.id})">View Ingredients ↗</button>
        <div class="protein-track">
          <div class="pt-label"><span class="pt-text">Protein content</span><span class="pt-val">${p.protein}g ${p.unit}</span></div>
          <div class="pt-bar"><div class="pt-fill" style="width:${barW}%"></div></div>
        </div>
        <div class="pcard-foot">
          <div>
            <div class="pcard-price">₹${p.price}</div>
            <div class="pcard-mrp">MRP ₹${p.mrp}</div>
          </div>
          <button class="add-btn ${inCart?'added':''}" onclick="addCart(${p.id})">${inCart?'✓ Added':'Add to cart'}</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ═══════════════ CART ═══════════════ */
function addCart(id){
  cart[id]=(cart[id]||0)+1;
  updCart();
  showToast('Added to cart! 🎉');
  renderShop();
  renderBundle();
}

function chgQty(id,d){
  cart[id]=Math.max(0,(cart[id]||0)+d);
  if(!cart[id])delete cart[id];
  updCart();
  renderCart();
  renderShop();
}

function updCart(){
  const n=Object.values(cart).reduce((a,b)=>a+b,0);
  document.getElementById('cc').textContent=n;
}

function renderCart(){
  const box=document.getElementById('cart-items-box');
  const sum=document.getElementById('order-summary');
  if(!box||!sum)return;
  const entries=Object.entries(cart).filter(([,q])=>q>0);
  if(!entries.length){
    box.innerHTML=`<div class="empty-cart"><div class="ec-icon">🛒</div><div class="ec-title">Your cart is empty</div><div class="ec-sub">Add some fresh protein products!</div><button class="ec-btn" onclick="showPage('shop')">Shop Now</button></div>`;
    sum.innerHTML='';return;
  }
  const sub=entries.reduce((s,[id,q])=>s+products.find(p=>p.id==id).price*q,0);
  const mrpTotal=entries.reduce((s,[id,q])=>s+products.find(p=>p.id==id).mrp*q,0);
  const del=sub>=499?0:49;
  const total=sub+del;
  const saved=mrpTotal-total;
  const freeShipLeft=Math.max(0,499-sub);
  const shipPct=Math.min(100,(sub/499)*100);

  // Upsell: find products NOT in cart
  const upsells=products.filter(p=>!cart[p.id]);

  box.innerHTML=`<div class="cart-panel-head">Items (${entries.length})</div>`+
    entries.map(([id,q])=>{
      const p=products.find(x=>x.id==id);
      return`<div class="ci">
        <div class="ci-thumb" style="background:${p.bg}"><span style="font-size:28px">${p.icon}</span></div>
        <div class="ci-info"><div class="ci-name">${p.name}</div><div class="ci-sub">${p.sub}</div></div>
        <div class="qty-ctrl"><button class="qb" onclick="chgQty(${id},-1)">−</button><div class="qn">${q}</div><button class="qb" onclick="chgQty(${id},1)">+</button></div>
        <div class="ci-price">₹${p.price*q}</div>
      </div>`;
    }).join('')+
    (upsells.length?`<div class="upsell-section">
      <div class="upsell-title">Customers also buy</div>
      <div class="upsell-row">${upsells.slice(0,2).map(p=>`<div class="upsell-item">
        <span class="upsell-icon">${p.icon}</span>
        <div class="upsell-info"><div class="upsell-name">${p.name}</div><div class="upsell-price">₹${p.price}</div></div>
        <button class="upsell-btn" onclick="addCart(${p.id});renderCart()">+ Add</button>
      </div>`).join('')}</div>
    </div>`:'');

  const pts=calcLoyaltyForAmount(total);
  sum.innerHTML=`<div class="os-head"><div class="os-head-title">Order Summary</div></div>
    <div class="os-body">
      <div class="ship-progress">
        <div class="ship-bar"><div class="ship-fill" style="width:${shipPct}%"></div></div>
        <div class="ship-text">${freeShipLeft>0?`Add ₹${freeShipLeft} more for FREE delivery 🚚`:'✓ Free delivery unlocked!'}</div>
      </div>
      <div class="os-row"><span class="os-label">Subtotal</span><span class="os-val">₹${sub}</span></div>
      <div class="os-row"><span class="os-label">Delivery</span><span class="os-val">${del===0?'FREE ✓':'₹'+del}</span></div>
      <hr class="os-divider"/>
      <div class="os-total"><span class="os-total-label">Total</span><span class="os-total-val">₹${total}</span></div>
      ${saved>0?`<div class="savings-strip"><div class="ss-main">You save ₹${saved} vs retail!</div></div>`:''}
      <div class="loyalty-strip">🏆 You'll earn <strong>${pts} points</strong> with this order</div>
      <button class="checkout-btn" onclick="showModal('order')">Place Order</button>
      <button class="wa-btn" onclick="orderWhatsApp()">💬 Order on WhatsApp</button>
      <div class="trust-badges">
        <span class="tb">✓ Fresh made</span>
        <span class="tb">✓ No preservatives</span>
        <span class="tb">✓ 24hr dispatch</span>
      </div>
    </div>`;
}

/* ═══════════════ PROTEIN CALCULATOR ═══════════════ */
function calcProtein(){
  const w=parseFloat(document.getElementById('weight').value)||70;
  const goal=parseFloat(document.getElementById('goal').value);
  const need=Math.round(w*goal);
  document.getElementById('cr-val').textContent=need+'g';
  const diet=document.getElementById('diet').value;
  let fromFood=diet==='high'?40:diet==='mid'?20:10;
  const gap=need-fromFood;

  // Build recommendation
  let recs=[];
  let remaining=gap;
  if(remaining>0){recs.push({id:1,qty:Math.min(3,Math.ceil(remaining/20))});remaining-=recs[0].qty*10;}
  if(remaining>0){recs.push({id:2,qty:Math.min(2,Math.ceil(remaining/12))});remaining-=recs[recs.length-1].qty*12;}
  if(remaining>0){recs.push({id:3,qty:1});remaining-=17;}
  if(remaining>0){recs.push({id:4,qty:1});}

  const recsHtml=recs.map(r=>{
    const p=products.find(x=>x.id===r.id);
    return`<div class="rec-item"><span>${p.icon} ${r.qty}× ${p.name}</span><span class="rec-protein">${p.protein*r.qty}g protein</span></div>`;
  }).join('');

  const comboPrice=recs.reduce((s,r)=>s+products.find(x=>x.id===r.id).price*r.qty,0);

  document.getElementById('cr-products').innerHTML=`
    <div class="rec-gap">Your diet gives ~${fromFood}g/day. <strong>You need ${gap}g more.</strong></div>
    <div class="rec-title">Recommended daily combo</div>
    ${recsHtml}
    <div class="rec-total">Combo price: <strong>₹${comboPrice}</strong></div>
    <button class="rec-add-btn" onclick='addComboToCart(${JSON.stringify(recs)})'>Add Recommended Combo to Cart</button>`;
  document.getElementById('calc-result').style.display='block';

  // Store for addCombo
  window._lastRecs=recs;
}

function addComboToCart(recs){
  recs.forEach(r=>{cart[r.id]=(cart[r.id]||0)+r.qty;});
  updCart();
  showToast('Combo added to cart! 🎉');
  renderShop();
}

/* ═══════════════ BUNDLE BUILDER ═══════════════ */
function renderBundle(){
  const grid=document.getElementById('bundle-grid');
  if(!grid)return;
  grid.innerHTML=products.map(p=>{
    const qty=bundle[p.id]||0;
    return`<div class="bb-item">
      <div class="bb-icon" style="background:${p.bg}">${p.icon}</div>
      <div class="bb-info">
        <div class="bb-name">${p.name}</div>
        <div class="bb-price">₹${p.price}</div>
      </div>
      <div class="bb-controls">
        ${qty>0?`<button class="qb" onclick="removeFromBundle(${p.id})">−</button><span class="bb-qty">${qty}</span>`:''}
        <button class="qb bb-plus" onclick="addToBundle(${p.id})">+</button>
      </div>
    </div>`;
  }).join('');
  // Update total
  const total=Object.entries(bundle).reduce((s,[id,q])=>s+products.find(p=>p.id==id).price*q,0);
  const count=Object.values(bundle).reduce((a,b)=>a+b,0);
  const el=document.getElementById('bundle-summary');
  if(el) el.innerHTML=count>0?`<div class="bs-row"><span>${count} items</span><span class="bs-total">₹${total}</span></div><button class="bs-add" onclick="addBundleToCart()">Add Bundle to Cart</button>`:`<div class="bs-empty">Select products to build your box</div>`;
}

function addToBundle(id){bundle[id]=(bundle[id]||0)+1;renderBundle();}
function removeFromBundle(id){bundle[id]=Math.max(0,(bundle[id]||0)-1);if(!bundle[id])delete bundle[id];renderBundle();}

function addBundleToCart(){
  if(!Object.keys(bundle).length)return showToast('Add products to your bundle first');
  Object.entries(bundle).forEach(([id,q])=>{cart[id]=(cart[id]||0)+q;});
  bundle={};
  updCart();renderBundle();
  showToast('Bundle added to cart! 📦');
}

/* ═══════════════ 21-DAY CHALLENGE ═══════════════ */
function renderChallenge(){
  const el=document.getElementById('challenge-content');
  if(!el)return;
  if(!challengeActive){
    el.innerHTML=`<div class="ch-start">
      <div class="ch-desc">Track your protein intake for 21 days and earn a <strong>₹100 discount coupon</strong>!</div>
      <button class="ch-start-btn" onclick="startChallenge()">Start Challenge</button>
    </div>`;
  } else if(challengeDay>=21){
    el.innerHTML=`<div class="ch-complete">
      <div class="ch-emoji">🎉</div>
      <div class="ch-msg">Challenge Complete!</div>
      <div class="ch-coupon">Your coupon code: <strong>PROTEIN100</strong></div>
      <div class="ch-coupon-sub">Use at checkout for ₹100 off</div>
      <button class="ch-reset-btn" onclick="resetChallenge()">Start Again</button>
    </div>`;
  } else {
    const pct=Math.round((challengeDay/21)*100);
    el.innerHTML=`<div class="ch-active">
      <div class="ch-progress-label">Day ${challengeDay} of 21</div>
      <div class="ch-bar"><div class="ch-fill" style="width:${pct}%"></div></div>
      <div class="ch-pct">${pct}% complete</div>
      <button class="ch-track-btn" onclick="trackDay()">✓ Log Today's Protein</button>
      <div class="ch-tip">Tip: Aim for ${60+Math.floor(Math.random()*20)}g protein today</div>
    </div>`;
  }
}

function startChallenge(){challengeActive=true;challengeDay=0;saveChallenge();renderChallenge();}
function resetChallenge(){challengeActive=false;challengeDay=0;saveChallenge();renderChallenge();}
function trackDay(){
  if(challengeDay<21){challengeDay++;saveChallenge();renderChallenge();showToast(`Day ${challengeDay} logged! 💪`);}
}
function saveChallenge(){localStorage.setItem('dp_challenge',challengeDay);localStorage.setItem('dp_challenge_active',challengeActive);}

/* ═══════════════ INGREDIENTS MODAL ═══════════════ */
function showIngredients(id){
  const p=products.find(x=>x.id===id);
  const m=document.getElementById('modal');
  const mc=document.getElementById('modal-content');
  mc.innerHTML=`<div class="ingr-modal">
    <div class="ingr-header"><span style="font-size:40px">${p.icon}</span><div class="ingr-title">${p.name}</div></div>
    <div class="ingr-section">
      <div class="ingr-section-title">Ingredients</div>
      ${p.ingredients.map(i=>`<div class="ingr-row"><span class="ingr-check">✓</span>${i}</div>`).join('')}
    </div>
    <div class="ingr-badges">
      <span class="ingr-badge good">No preservatives</span>
      <span class="ingr-badge good">No refined sugar</span>
      <span class="ingr-badge good">No chemicals</span>
    </div>
    <div class="ingr-section">
      <div class="ingr-section-title">Sourced From</div>
      <div class="ingr-source">${p.source}</div>
    </div>
    <button class="modal-btn" onclick="document.getElementById('modal').classList.remove('show')">Close</button>
  </div>`;
  m.classList.add('show');
}

/* ═══════════════ WHATSAPP ORDER ═══════════════ */
function orderWhatsApp(){
  const entries=Object.entries(cart).filter(([,q])=>q>0);
  if(!entries.length)return showToast('Cart is empty!');
  const sub=entries.reduce((s,[id,q])=>s+products.find(p=>p.id==id).price*q,0);
  const lines=entries.map(([id,q])=>{const p=products.find(x=>x.id==id);return`${q}× ${p.name} — ₹${p.price*q}`;}).join('%0A');
  const msg=`Hi! I'd like to order from ProtIN:%0A%0A${lines}%0A%0ATotal: ₹${sub}%0A%0APlease confirm my order!`;
  window.open(`https://wa.me/919999999999?text=${msg}`,'_blank');
}

/* ═══════════════ LOYALTY ═══════════════ */
function calcLoyaltyForAmount(amt){
  if(amt>=1000)return 120;
  if(amt>=500)return 50;
  if(amt>=300)return 20;
  return 0;
}

function renderLoyalty(){
  const el=document.getElementById('loyalty-display');
  if(!el)return;
  const tier=loyaltyPoints>=200?'Gold':loyaltyPoints>=100?'Silver':'Bronze';
  el.innerHTML=`<div class="loy-points">${loyaltyPoints}</div>
    <div class="loy-label">Total Points</div>
    <div class="loy-tier">${tier} Member</div>
    <div class="loy-info">
      <div class="loy-rule">Spend ₹500 → earn 50 pts</div>
      <div class="loy-rule">Spend ₹1000 → earn 120 pts</div>
      <div class="loy-rule">100 pts = ₹50 discount</div>
    </div>`;
}

/* ═══════════════ NAVIGATION ═══════════════ */
function showPage(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('.nl').forEach(n=>n.classList.remove('on'));
  document.getElementById(page+'-page').classList.add('on');
  const map={home:0,shop:1,bundle:2,calculator:3};
  if(map[page]!==undefined)document.querySelectorAll('.nl')[map[page]]?.classList.add('on');
  if(page==='cart')renderCart();
  if(page==='shop')renderShop();
  if(page==='bundle'){renderBundle();renderChallenge();renderLoyalty();}
  if(page==='calculator')renderShop();
  window.scrollTo({top:0,behavior:'smooth'});
}

/* ═══════════════ MODAL & TOAST ═══════════════ */
function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2500);
}

function showModal(type){
  const m=document.getElementById('modal');
  const mc=document.getElementById('modal-content');
  if(type==='order'){
    const total=Object.entries(cart).filter(([,q])=>q>0).reduce((s,[id,q])=>s+products.find(p=>p.id==id).price*q,0);
    const pts=calcLoyaltyForAmount(total);
    loyaltyPoints+=pts;
    localStorage.setItem('dp_loyalty',loyaltyPoints);
    mc.innerHTML=`<div class="modal-emoji">🎉</div>
      <div class="modal-title">Order Placed!</div>
      <div class="modal-sub">Your fresh ProtIN is being made right now! Dispatched within 24 hours. You'll get a WhatsApp update.</div>
      <div class="modal-loyalty">+${pts} loyalty points earned! 🏆</div>
      <button class="modal-btn" onclick="cart={};updCart();document.getElementById('modal').classList.remove('show');showPage('home')">Back to Home</button>`;
  }
  m.classList.add('show');
}

/* ═══════════════ INIT ═══════════════ */
renderShop();
