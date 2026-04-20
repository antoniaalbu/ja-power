/* LOADER */
let pct = 0;
const loaderPerc = document.getElementById('loader-perc');
const li = setInterval(() => {
  pct += Math.random() * 22 + 3;
  if (pct >= 100) { pct = 100; clearInterval(li); }
  loaderPerc.textContent = Math.round(pct) + '%';
}, 110);
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    if (heroImg) {
      heroImg.style.animation = 'slideUp 1s cubic-bezier(0.34,1.56,0.64,1) forwards';
    }
  }, 1500);
});

/* CURSOR */
const cg = document.getElementById('cursor-glow');
document.addEventListener('mousemove', e => {
  cg.style.left = e.clientX + 'px';
  cg.style.top  = e.clientY + 'px';
});

/* NAV SCROLL / HIDE */
let lastY = 0;
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar'), y = window.scrollY;
  nav.classList.toggle('scrolled', y > 60);
  nav.classList.toggle('hidden', y > lastY && y > 200);
  lastY = y;
});

/* ── BURGER / DRAWER ── */
const burger        = document.getElementById('burger');
const drawer        = document.getElementById('drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const drawerClose   = document.getElementById('drawer-close');

function openDrawer() {
  drawer.classList.add('open');
  drawerOverlay.classList.add('open');
  burger.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  drawer.classList.remove('open');
  drawerOverlay.classList.remove('open');
  burger.classList.remove('open');
  document.body.style.overflow = '';
}

burger.addEventListener('click', openDrawer);
drawerClose.addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', closeDrawer);

/* Close drawer when a link is tapped */
document.querySelectorAll('.drawer-link').forEach(link => {
  link.addEventListener('click', closeDrawer);
});

/* ════════════════════════════════════════
   GLOBAL BG CANVAS
════════════════════════════════════════ */
(function(){
  const cv = document.getElementById('bg-canvas');
  const cx = cv.getContext('2d');
  let W, H, pts = [];
  function resize(){ W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);
  function mkPt(init){
    return {
      x: Math.random()*W, y: init ? Math.random()*H : H+4,
      vx:(Math.random()-0.5)*0.25, vy:-(Math.random()*0.4+0.1),
      a: Math.random()*0.3+0.05, s: Math.random()*1.2+0.3,
      life:0, maxL: Math.random()*220+80
    };
  }
  for(let i=0;i<70;i++) pts.push(mkPt(true));
  function frame(){
    cx.clearRect(0,0,W,H);
    cx.strokeStyle='rgba(0,208,132,0.018)'; cx.lineWidth=1;
    for(let x=0;x<W;x+=64){ cx.beginPath(); cx.moveTo(x,0); cx.lineTo(x,H); cx.stroke(); }
    for(let y=0;y<H;y+=64){ cx.beginPath(); cx.moveTo(0,y); cx.lineTo(W,y); cx.stroke(); }
    pts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.life++;
      if(p.y<-4||p.life>p.maxL) Object.assign(p, mkPt(false), {x:Math.random()*W});
      const a = Math.sin((p.life/p.maxL)*Math.PI)*p.a;
      cx.beginPath(); cx.arc(p.x,p.y,p.s,0,Math.PI*2);
      cx.fillStyle=`rgba(0,208,132,${a})`; cx.fill();
    });
    requestAnimationFrame(frame);
  }
  frame();
})();

/* ════════════════════════════════════════
   HERO CANVAS — rings + flow lines + hex dots
════════════════════════════════════════ */
(function(){
  const cv = document.getElementById('hero-canvas');
  const cx = cv.getContext('2d');
  let W, H;
  function resize(){
    const hero = document.getElementById('hero');
    W = cv.width = hero.offsetWidth;
    H = cv.height = hero.offsetHeight;
  }
  resize(); window.addEventListener('resize', resize);

  function hexDots(){
    const sp=70, rows=Math.ceil(H/(sp*0.866))+1, cols=Math.ceil(W/sp)+1;
    cx.fillStyle='rgba(0,208,132,0.035)';
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
      const x=c*sp+(r%2?sp/2:0), y=r*sp*0.866;
      cx.beginPath(); cx.arc(x,y,1.2,0,Math.PI*2); cx.fill();
    }
  }

  function mkLine(init){
    return {
      x: Math.random()*W,
      y: init ? Math.random()*H : H+20,
      spd: Math.random()*1.4+0.4,
      len: Math.random()*90+40,
      a: Math.random()*0.28+0.04,
      w: Math.random()*0.9+0.2,
      wb: Math.random()*Math.PI*2
    };
  }
  const lines = Array.from({length:35}, (_,i)=>mkLine(true));
  const rings = [0,60,120].map(d=>({life:-d, max:190, delay:d}));

  function frame(){
    cx.clearRect(0,0,W,H);
    hexDots();
    lines.forEach(l=>{
      l.y-=l.spd; l.wb+=0.035; l.x+=Math.sin(l.wb)*0.35;
      if(l.y+l.len<0) Object.assign(l, mkLine(false), {x:Math.random()*W});
      const g=cx.createLinearGradient(l.x,l.y,l.x,l.y-l.len);
      g.addColorStop(0,'rgba(0,208,132,0)');
      g.addColorStop(0.5,`rgba(0,208,132,${l.a})`);
      g.addColorStop(1,'rgba(0,255,159,0)');
      cx.strokeStyle=g; cx.lineWidth=l.w;
      cx.beginPath(); cx.moveTo(l.x,l.y); cx.lineTo(l.x+Math.sin(l.wb)*12,l.y-l.len); cx.stroke();
    });
    rings.forEach(r=>{
      r.life++;
      if(r.life>r.max) r.life=-r.delay;
      if(r.life<0) return;
      const prog=r.life/r.max;
      const rad=prog*Math.min(W,H)*0.44;
      const a=(1-prog)*0.13;
      cx.beginPath(); cx.arc(W/2,H/2,rad,0,Math.PI*2);
      cx.strokeStyle=`rgba(0,208,132,${a})`; cx.lineWidth=1.5*(1-prog); cx.stroke();
    });
    requestAnimationFrame(frame);
  }
  frame();
})();

/* INTERSECTION OBSERVERS */
const io = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    e.target.classList.add('visible');
    e.target.querySelectorAll('.cbar-fill').forEach(b=>{ b.style.width=b.dataset.w+'%'; });
    io.unobserve(e.target);
  });
},{threshold:0.12});
document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el=>io.observe(el));

const statsInner = document.querySelector('.stats-inner');
if (statsInner) {
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.stat-cell').forEach((c, i) => {
        setTimeout(() => {
          c.style.transition = 'opacity 0.6s,transform 0.6s cubic-bezier(0.4,0,0.2,1),all 0.3s';
          c.style.opacity = '1';
          c.style.transform = 'translateY(0)';
          c.querySelectorAll('.stat-bar-fill').forEach(b => { b.style.width = b.dataset.w + '%'; });
        }, i * 120);
      });
    });
  }, { threshold: 0.25 }).observe(statsInner);
}

new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    e.target.querySelectorAll('.tech-card').forEach((c,i)=>{
      setTimeout(()=>{
        c.style.transition='opacity 0.7s,transform 0.7s cubic-bezier(0.4,0,0.2,1),all 0.4s cubic-bezier(0.4,0,0.2,1)';
        c.style.opacity='1'; c.style.transform='translateY(0)';
      },i*80);
    });
  });
},{threshold:0.08}).observe(document.querySelector('.tech-grid'));

new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    e.target.querySelectorAll('.accordion-item').forEach((item,i)=>{
      setTimeout(()=>{
        item.style.transition='opacity 0.5s,transform 0.5s cubic-bezier(0.4,0,0.2,1),all 0.3s';
        item.style.opacity='1'; item.style.transform='translateX(0)';
      },i*70);
    });
  });
},{threshold:0.08}).observe(document.querySelector('.accordion-group'));

/* ACCORDION */
document.querySelectorAll('.accordion-header').forEach(h=>{
  h.addEventListener('click',()=>{
    const item=h.closest('.accordion-item'), was=item.classList.contains('active');
    item.parentElement.querySelectorAll('.accordion-item').forEach(el=>el.classList.remove('active'));
    if(!was) item.classList.add('active');
  });
});

/* ── 3D HERO PRODUCT IMAGE EFFECTS ── */
const heroImg     = document.querySelector('.hero-product-img');
const heroWrapper = document.querySelector('.hero-product-wrapper');

if (heroImg && heroWrapper) {
  let animationComplete = false;
  let isHovering = false;
  let currentRotateX = 0;
  let currentRotateY = 0;
  let currentScrollY = 0;

  setTimeout(() => { animationComplete = true; }, 2000);

  document.addEventListener('mousemove', (e) => {
    if (!animationComplete) return;
    const hero = document.querySelector('.hero');
    if (!hero || !hero.contains(e.target.closest && e.target.closest('.hero-product-wrapper'))) return;
    isHovering = true;
    const rect = heroWrapper.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - rect.width / 2)  / rect.width;
    const mouseY = (e.clientY - rect.top  - rect.height / 2) / rect.height;
    currentRotateX = -mouseY * 15;
    currentRotateY =  mouseX * 15;
    heroImg.style.transform = `translateY(${currentScrollY}px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) scale(1.05)`;
  });

  heroWrapper.addEventListener('mouseleave', () => {
    if (!animationComplete) return;
    isHovering = false; currentRotateX = 0; currentRotateY = 0;
    heroImg.style.transform = `translateY(${currentScrollY}px) rotateX(0deg) rotateY(0deg) scale(1)`;
  });

  window.addEventListener('scroll', () => {
    if (!animationComplete) return;
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const heroRect = hero.getBoundingClientRect();
    currentScrollY = (heroRect.top + heroRect.height / 2 - window.innerHeight / 2) * 0.5;
    if (!isHovering) {
      const vis = Math.max(0, Math.min(1, 1 - heroRect.top / window.innerHeight));
      heroImg.style.transform = `translateY(${currentScrollY}px) rotateX(${vis * 20}deg) rotateY(0deg) scale(1)`;
    } else {
      heroImg.style.transform = `translateY(${currentScrollY}px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) scale(1.05)`;
    }
  });
}

const themeToggle = document.getElementById('theme-toggle');
const themeStyle = document.getElementById('theme-style');

let currentTheme = 'dark';

themeToggle.addEventListener('click', () => {
  if (currentTheme === 'light') {
    themeStyle.href = 'dark.css';
    currentTheme = 'dark';
    themeToggle.textContent = '☀️';
  } else {
    themeStyle.href = 'light.css';
    currentTheme = 'light';
    themeToggle.textContent = '🌙';
  }
});