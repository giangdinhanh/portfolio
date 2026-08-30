const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('.site-nav');
menuButton?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
document.querySelectorAll('.site-nav a').forEach(link=>link.addEventListener('click',()=>nav.classList.remove('open')));

const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.14});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

const roles=['a Data Analyst','a BI Analyst','an AI Support Analyst'];let roleIndex=0;
const roleEl=document.querySelector('#typed-role');
setInterval(()=>{roleIndex=(roleIndex+1)%roles.length;roleEl.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-8px)'}],{duration:220,fill:'forwards'}).onfinish=()=>{roleEl.textContent=roles[roleIndex];roleEl.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,fill:'forwards'});};},2600);

document.querySelector('#year').textContent=new Date().getFullYear();

const sections=[...document.querySelectorAll('main section[id], header[id]')];
const navLinks=[...document.querySelectorAll('.site-nav a')];
window.addEventListener('scroll',()=>{let current='home';sections.forEach(section=>{if(window.scrollY>=section.offsetTop-140)current=section.id;});navLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')===`#${current}`));},{passive:true});

// Expandable resume cards: plus becomes minus and the card grows downward.
document.querySelectorAll('[data-expand-card]').forEach(card => {
  const button = card.querySelector('.resume-toggle');
  const controlledId = button?.getAttribute('aria-controls');
  button?.addEventListener('click', () => {
    const expanded = card.classList.toggle('expanded');
    button.setAttribute('aria-expanded', String(expanded));
    const sectionName = controlledId?.includes('education') ? 'education' : 'work experience';
    button.setAttribute('aria-label', `${expanded ? 'Show less' : 'Show more'} ${sectionName}`);
  });
});

// Restore loader, header, hero parallax, magnetic controls, and thumbnail tilt.
window.addEventListener('load', () => {
  window.setTimeout(() => document.querySelector('.page-loader')?.classList.add('loaded'), 220);
});

const header = document.querySelector('.site-header');
const progress = document.querySelector('.scroll-progress');
const updateScrollEffects = () => {
  const y = window.scrollY;
  header?.classList.toggle('scrolled', y > 45);
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  if (progress) progress.style.width = `${Math.min(100, (y / max) * 100)}%`;
};
window.addEventListener('scroll', updateScrollEffects, { passive: true });
updateScrollEffects();

const canHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canHover && !reduceMotion) {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('pointermove', event => {
      const r = el.getBoundingClientRect();
      const x = (event.clientX - r.left - r.width / 2) * .16;
      const y = (event.clientY - r.top - r.height / 2) * .16;
      el.style.transform = `translate(${x}px,${y}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  document.querySelectorAll('[data-tilt], .tilt-card').forEach(el => {
    el.addEventListener('pointermove', event => {
      const r = el.getBoundingClientRect();
      const px = (event.clientX - r.left) / r.width - .5;
      const py = (event.clientY - r.top) / r.height - .5;
      const amount = el.classList.contains('project-card') ? 5 : 7;
      el.style.transform = `perspective(900px) rotateX(${-py * amount}deg) rotateY(${px * amount}deg) translateY(-4px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  const hero = document.querySelector('[data-parallax-root]');
  hero?.addEventListener('pointermove', event => {
    const r = hero.getBoundingClientRect();
    const x = (event.clientX - r.left) / r.width - .5;
    const y = (event.clientY - r.top) / r.height - .5;
    hero.querySelectorAll('[data-depth]').forEach(el => {
      const d = Number(el.dataset.depth || 0);
      el.style.transform = `translate3d(${x * d * 90}px,${y * d * 70}px,0)`;
    });
  });
  hero?.addEventListener('pointerleave', () => {
    hero.querySelectorAll('[data-depth]').forEach(el => { el.style.transform = ''; });
  });
}

// Interactive hero: matrix preview, cursor-reveal city, and double-click 7-layer parallax.
(() => {
  const hero = document.querySelector('[data-interactive-hero]');
  if (!hero) return;

  const layers = [...hero.querySelectorAll('[data-parallax-layer]')];
  const message = hero.querySelector('.hero-cursor-message');
  const messageText = hero.querySelector('[data-cursor-message]');
  const exploreButton = hero.querySelector('[data-explore-button]');
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let frame = 0;

  const lerp = (start, end, amount) => start + (end - start) * amount;

  const render = () => {
    currentX = lerp(currentX, targetX, 0.075);
    currentY = lerp(currentY, targetY, 0.075);

    if (hero.classList.contains('is-exploring') && !reduced) {
      layers.forEach(layer => {
        const move = Number(layer.dataset.move || 0);
        const vmove = Number(layer.dataset.vmove || move * 0.55);
        const scale = Number(layer.dataset.scale || 1);
        layer.style.transform = `translate3d(${-currentX * move}px, ${-currentY * vmove}px, 0) scale(${scale})`;
      });
    }

    if (Math.abs(targetX-currentX) > 0.002 || Math.abs(targetY-currentY) > 0.002) {
      frame = requestAnimationFrame(render);
    } else {
      frame = 0;
    }
  };

  const requestRender = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  const updateModeLabel = () => {
    const exploring = hero.classList.contains('is-exploring');
    if (messageText) messageText.textContent = exploring ? 'Move to explore' : 'Double-click to explore';
    if (exploreButton) {
      exploreButton.textContent = exploring ? 'Close city' : 'Explore city';
      exploreButton.setAttribute('aria-pressed', String(exploring));
    }
  };

  const toggleExplore = () => {
    hero.classList.toggle('is-exploring');
    targetX = 0;
    targetY = 0;
    updateModeLabel();
    requestRender();
  };

  hero.addEventListener('pointerenter', () => hero.classList.add('is-hovering'));
  hero.addEventListener('pointerleave', () => {
    hero.classList.remove('is-hovering');
    targetX = 0;
    targetY = 0;
    requestRender();
  });

  hero.addEventListener('pointermove', event => {
    const rect = hero.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    const nx = Math.max(-1, Math.min(1, (localX / rect.width - 0.5) * 2));
    const ny = Math.max(-1, Math.min(1, (localY / rect.height - 0.5) * 2));

    hero.style.setProperty('--hero-x', `${localX}px`);
    hero.style.setProperty('--hero-y', `${localY}px`);
    targetX = nx;
    targetY = ny;

    if (message && finePointer) {
      const offset = 20;
      const messageWidth = message.offsetWidth || 190;
      const messageHeight = message.offsetHeight || 42;
      const x = Math.min(rect.width - messageWidth - 12, Math.max(12, localX + offset));
      const y = Math.min(rect.height - messageHeight - 12, Math.max(88, localY + offset));
      message.style.transform = `translate3d(${x}px,${y}px,0) scale(1)`;
    }

    requestRender();
  });

  hero.addEventListener('dblclick', event => {
    if (event.target.closest('a,button')) return;
    toggleExplore();
  });

  hero.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleExplore();
    }
    if (event.key === 'Escape' && hero.classList.contains('is-exploring')) toggleExplore();
  });

  exploreButton?.addEventListener('click', toggleExplore);
  updateModeLabel();
})();
