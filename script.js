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
function wireCardRipple(card){
  card.addEventListener('pointermove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--rx', x + '%');
    card.style.setProperty('--ry', y + '%');
  });
}

// ============================================================
// GitHub repositories — fetched live and rendered into the
// horizontal rail, sorted so the strongest repos lead
// ============================================================
const GITHUB_USERNAME = 'shiro-dv';
const MAX_REPOS = 12;

(function loadRepos(){
  const rail = document.getElementById('projectsRail');
  const status = document.getElementById('railStatus');
  const template = document.getElementById('cardTemplate');
  if (!rail || !template) return;

  fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`)
    .then(res => {
      if (!res.ok) throw new Error(res.status === 404 ? 'User not found' : 'GitHub API error');
      return res.json();
    })
    .then(repos => {
      const filtered = repos
        .filter(r => !r.fork)
        .sort((a, b) => {
          // Primary: stars desc. Secondary: most recently pushed.
          if (b.stargazers_count !== a.stargazers_count){
            return b.stargazers_count - a.stargazers_count;
          }
          return new Date(b.pushed_at) - new Date(a.pushed_at);
        })
        .slice(0, MAX_REPOS);

      if (!filtered.length){
        status.textContent = 'No public repositories found yet.';
        return;
      }

      rail.innerHTML = '';

      filtered.forEach((repo, i) => {
        const node = template.content.firstElementChild.cloneNode(true);

        node.href = repo.html_url;
        node.querySelector('.card-index').textContent = `REPO / ${String(i + 1).padStart(2, '0')}`;

        const pushedDaysAgo = (Date.now() - new Date(repo.pushed_at)) / 86400000;
        const statusLabel = repo.archived ? 'ARCHIVED' : (pushedDaysAgo < 60 ? 'ACTIVE' : 'STABLE');
        node.querySelector('.card-status-label').textContent = statusLabel;

        node.querySelector('.card-name-text').textContent = repo.name;
        node.querySelector('.card-desc').textContent = repo.description || 'No description provided.';

        const tagsEl = node.querySelector('.card-tags');
        const tags = [];
        if (repo.language) tags.push(repo.language);
        if (repo.stargazers_count > 0) tags.push(`★ ${repo.stargazers_count}`);
        tags.push(`Updated ${formatDate(repo.pushed_at)}`);
        tags.forEach(t => {
          const span = document.createElement('span');
          span.className = 'tag';
          span.textContent = t;
          tagsEl.appendChild(span);
        });

        wireCardRipple(node);
        rail.appendChild(node);
      });

      initRailArrows();
    })
    .catch(err => {
      status.classList.add('error');
      status.textContent = `Couldn't load repositories (${err.message}). Set GITHUB_USERNAME in script.js.`;
    });
})();

function formatDate(iso){
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// ============================================================
// Rail arrows — scroll the repo rail left/right by one card's
// width, disabling arrows at each end
// ============================================================
function initRailArrows(){
  const rail = document.getElementById('projectsRail');
  const prev = document.getElementById('railPrev');
  const next = document.getElementById('railNext');
  if (!rail || !prev || !next) return;

  function step(){
    const card = rail.querySelector('.card');
    return card ? card.getBoundingClientRect().width + 1 : 320;
  }

  function updateArrows(){
    const max = rail.scrollWidth - rail.clientWidth - 2;
    prev.disabled = rail.scrollLeft <= 2;
    next.disabled = rail.scrollLeft >= max;
    // If content doesn't overflow, hide both arrows
    const overflowing = rail.scrollWidth > rail.clientWidth + 2;
    prev.style.display = overflowing ? '' : 'none';
    next.style.display = overflowing ? '' : 'none';
  }

  prev.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: 'smooth' }));
  rail.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);

  updateArrows();
}
