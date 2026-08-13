// ============================================================
// Starfield — scattered twinkling dots layered over the hero art
// ============================================================
(function generateStars(){
  const el = document.getElementById('stars');
  if (!el) return;
  const count = 60;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++){
    const s = document.createElement('span');
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 55 + '%';
    s.style.animationDelay = (Math.random() * 5).toFixed(2) + 's';
    s.style.opacity = (0.2 + Math.random() * 0.5).toFixed(2);
    frag.appendChild(s);
  }
  el.appendChild(frag);
})();

// ============================================================
// Hero parallax — the scene drifts slower than the scroll,
// giving the planets and figure a sense of depth
// ============================================================
(function heroParallax(){
  const bg = document.getElementById('heroBg');
  if (!bg) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  let ticking = false;
  function update(){
    const y = window.scrollY;
    const shift = Math.min(y * 0.18, 140);
    bg.style.transform = `translateY(${shift}px) scale(1.04)`;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking){
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
})();

// ============================================================
// Ripple origin — positions the hover ripple rings on each
// project card at the cursor's entry point, echoing the
// water ripples in the hero artwork
// ============================================================
(function cardRipples(){
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--rx', x + '%');
      card.style.setProperty('--ry', y + '%');
    });
  });
})();
