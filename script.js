const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

/* =========================================================
   SAMICE SETTINGS
   Replace the placeholder number below with the real SamIce
   sales/WhatsApp number, digits only, e.g. 2348030000000.
   ========================================================= */
const CONFIG={
  salesPhone:'2348037722472',
  salesDisplay:'+234 803 772 2472',
  whatsappGreeting:'Hello SamIce, I\'d like to order ice blocks. Please confirm availability and delivery details.'
};

/* Local asset loader: supports JPG/WebP/PNG/SVG in assets/.
   For hero images, simply place hero-01.jpg, hero-02.jpg,
   hero-03.jpg in assets/; SVG remains the fallback. */
function loadAsset(img){
  const sources=(img.dataset.assets||'').split('|').map(s=>s.trim()).filter(Boolean);
  if(!sources.length)return;
  let i=0;
  const tryNext=()=>{if(i>=sources.length)return;img.onerror=()=>{i++;tryNext()};img.src=sources[i++]};
  tryNext();
}
$$('img[data-assets]').forEach(loadAsset);

/* Header + animated mobile menu */
const header=$('#header'),mobile=$('#mobileMenu'),menuBtn=$('#menuBtn'),menuClose=$('#menuClose'),backdrop=$('#menuBackdrop');
function closeMenu(){mobile.classList.remove('open');backdrop.classList.remove('show');menuBtn.setAttribute('aria-expanded','false');mobile.setAttribute('aria-hidden','true');document.body.classList.remove('menu-open')}
function openMenu(){mobile.classList.add('open');backdrop.classList.add('show');menuBtn.setAttribute('aria-expanded','true');mobile.setAttribute('aria-hidden','false');document.body.classList.add('menu-open')}
menuBtn?.addEventListener('click',()=>mobile.classList.contains('open')?closeMenu():openMenu());
menuClose?.addEventListener('click',closeMenu);backdrop?.addEventListener('click',closeMenu);
$$('#mobileMenu a[href^="#"]').forEach(a=>a.addEventListener('click',closeMenu));
addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
addEventListener('resize',()=>{if(innerWidth>760)closeMenu()});
addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>30),{passive:true});

/* Reliable smooth anchor scrolling */
document.addEventListener('click',e=>{
  const a=e.target.closest('a[href^="#"]');
  if(!a)return;
  const id=a.getAttribute('href');
  if(!id||id==='#')return;
  const target=$(id);
  if(!target)return;
  e.preventDefault();
  closeMenu();
  target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  history.replaceState(null,'',id);
});

/* Hero slideshow: autoplay, buttons, dots, keyboard and touch swipe */
const slides=$$('.slide'),dots=$$('#dots button'),counter=$('#counter');
let hi=0,timer=0,touchX=0;
function renderHero(i,restart=true){
  hi=(i+slides.length)%slides.length;
  slides.forEach((s,n)=>s.classList.toggle('active',n===hi));
  dots.forEach((d,n)=>{d.classList.toggle('on',n===hi);d.setAttribute('aria-current',n===hi?'true':'false')});
  if(counter)counter.textContent=`${String(hi+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
  if(restart){clearInterval(timer);if(!matchMedia('(prefers-reduced-motion: reduce)').matches)timer=setInterval(()=>renderHero(hi+1,false),6500)}
}
$('#prev')?.addEventListener('click',()=>renderHero(hi-1));$('#next')?.addEventListener('click',()=>renderHero(hi+1));
dots.forEach((d,i)=>d.addEventListener('click',()=>renderHero(i)));
$('.hero')?.addEventListener('mouseenter',()=>clearInterval(timer));
$('.hero')?.addEventListener('mouseleave',()=>renderHero(hi));
$('.hero')?.addEventListener('touchstart',e=>touchX=e.touches[0].clientX,{passive:true});
$('.hero')?.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>45)renderHero(hi+(dx<0?1:-1))},{passive:true});
renderHero(0);

/* 3D ice response to page scroll */
const ice=$('#ice');let lastY=scrollY,rot=0,raf=false;
addEventListener('scroll',()=>{
  const dy=scrollY-lastY;lastY=scrollY;rot+=dy*.62;
  if(!raf){raf=true;requestAnimationFrame(()=>{if(ice&&!matchMedia('(prefers-reduced-motion: reduce)').matches)ice.style.transform=`rotateX(${rot*.16}deg) rotateY(${rot}deg) rotateZ(-7deg)`;raf=false})}
},{passive:true});

/* Scroll reveal */
const revealObs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObs.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -45px'});
$$('.reveal').forEach(e=>revealObs.observe(e));

/* Reusable responsive touch slider */
function slider(track,prev,next,count,progress,desktop=3,tablet=2,mobile=1){
  if(!track)return;
  let i=0,startX=0,startY=0;
  const visible=()=>innerWidth<=760?mobile:innerWidth<=1100?tablet:desktop;
  function move(){
    const v=visible(),max=Math.max(0,count-v);i=Math.max(0,Math.min(i,max));
    track.style.transform=`translate3d(-${i*(100/v)}%,0,0)`;
    if(progress)progress.style.width=`${Math.min(100,((i+v)/count)*100)}%`;
    if(prev)prev.disabled=i<=0;if(next)next.disabled=i>=max;
  }
  prev?.addEventListener('click',()=>{i--;move()});next?.addEventListener('click',()=>{i++;move()});
  addEventListener('resize',move);
  const vp=track.parentElement;
  vp?.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;startY=e.touches[0].clientY},{passive:true});
  vp?.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){i+=dx<0?1:-1;move()}},{passive:true});
  move();
}
slider($('#shopTrack'),$('#shopPrev'),$('#shopNext'),3,$('#shopProgress'),3,2,1);

/* Reviews */
const reviews=[
  ['Ada N.','Home customer','Clean ice, easy ordering and dependable service.','assets/avatar-01.svg'],
  ['Chinedu O.','Business customer','Useful for keeping our daily operations cold.','assets/avatar-02.svg'],
  ['Ngozi E.','Event customer','The bulk order made our celebration much easier.','assets/avatar-03.svg'],
  ['Emeka P.','Retail customer','Straightforward service and good availability.','assets/avatar-04.svg']
];
const reviewsTrack=$('#reviewsTrack');
if(reviewsTrack){
  reviewsTrack.innerHTML=reviews.map(r=>`<article class="review"><div class="review-top"><img src="${r[3]}" alt="${r[0]}"><div><div class="review-name">${r[0]}</div><div class="review-role">${r[1]}</div></div></div><p>“${r[2]}”</p></article>`).join('');
  slider(reviewsTrack,$('#reviewPrev'),$('#reviewNext'),reviews.length,$('#reviewProgress'),4,2,1);
}

/* Cart, favourites and WhatsApp ordering */
let cart=Number(sessionStorage.getItem('samiceCart')||0),toastTimer;
function updateCart(){const el=$('#cartCount');if(el)el.textContent=cart;sessionStorage.setItem('samiceCart',String(cart))}
function toast(msg){const t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2200)}
updateCart();
$$('.heart').forEach(b=>b.addEventListener('click',()=>{const on=b.classList.toggle('active');b.textContent=on?'♥':'♡';b.setAttribute('aria-pressed',String(on));toast(on?'Added to favourites':'Removed from favourites')}));
$$('.cart-btn').forEach(b=>b.addEventListener('click',()=>{cart++;updateCart();const c=b.closest('.product-card');toast(`${c.dataset.product} added to cart`)}));
$('#clearCart')?.addEventListener('click',()=>{cart=0;updateCart();toast('Cart cleared')});
function waUrl(message){return `https://wa.me/${CONFIG.salesPhone}?text=${encodeURIComponent(message)}`}
$$('.order-btn').forEach(b=>b.addEventListener('click',()=>{const c=b.closest('.product-card');window.open(waUrl(`Hello SamIce, I'd like to order ${c.dataset.product} (${c.dataset.price}). Please confirm availability and delivery details.`),'_blank','noopener,noreferrer')}));
$$('.card-link[data-service]').forEach(a=>a.addEventListener('click',()=>{sessionStorage.setItem('samiceInquiry',a.dataset.service)}));

/* Contact / footer CTAs are configured in one place */
const callHref=`tel:+${CONFIG.salesPhone}`;
const waHref=waUrl(CONFIG.whatsappGreeting);
const call=$('#callSales'),footerPhone=$('#footerPhone');
if(call){call.href=callHref;const b=call.querySelector('b');if(b)b.textContent=CONFIG.salesDisplay}
if(footerPhone){footerPhone.href=callHref;footerPhone.textContent=CONFIG.salesDisplay}
$$('[data-whatsapp]').forEach(a=>{a.href=waHref;a.target='_blank';a.rel='noopener noreferrer'});
const fw=$('#footerWhatsApp');if(fw)fw.href=waHref;

/* Service enquiry context opens a useful prefilled WhatsApp message from Contact */
const inquiry=sessionStorage.getItem('samiceInquiry');
if(inquiry){sessionStorage.removeItem('samiceInquiry');setTimeout(()=>toast(`Ready for ${inquiry}. Use the WhatsApp sales button below.`),500)}
