const stage = document.querySelector('.stage');
const character = document.querySelector('#characterWrap');
const chrome = document.querySelector('#frameChrome');
const toggle = document.querySelector('#motionToggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionEnabled = !reducedMotion.matches;
let pointerX = 0;
let pointerY = 0;
let ticking = false;

function updateScene() {
  const scroll = window.scrollY;
  const progress = Math.min(scroll / Math.max(window.innerHeight, 1), 1);
  const turn = Math.min(scroll / (window.innerHeight * 2.1), 1);
  document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(3));
  document.documentElement.style.setProperty('--character-turn', `${turn * -8}deg`);
  stage.style.opacity = String(Math.max(0.18, 1 - Math.max(0, scroll - window.innerHeight * 1.35) / (window.innerHeight * 1.2)));
  chrome.style.opacity = String(Math.max(0, 1 - scroll / 260));
  const x = motionEnabled ? pointerX * 13 : 0;
  const y = motionEnabled ? pointerY * 9 : 0;
  character.style.setProperty('--pointer-x', `${x}px`);
  character.style.setProperty('--pointer-y', `${y}px`);
  ticking = false;
}

function scheduleUpdate() {
  if (!ticking) {
    requestAnimationFrame(updateScene);
    ticking = true;
  }
}

window.addEventListener('scroll', scheduleUpdate, { passive: true });
window.addEventListener('pointermove', (event) => {
  pointerX = event.clientX / window.innerWidth - 0.5;
  pointerY = event.clientY / window.innerHeight - 0.5;
  scheduleUpdate();
}, { passive: true });

function setMotion(enabled) {
  motionEnabled = enabled;
  document.body.classList.toggle('motion-paused', !enabled);
  toggle.setAttribute('aria-pressed', String(enabled));
  toggle.setAttribute('aria-label', enabled ? 'Pause character motion' : 'Play character motion');
  toggle.innerHTML = `<span class="motion-dot"></span> MOTION ${enabled ? 'ON' : 'OFF'}`;
  scheduleUpdate();
}

toggle.addEventListener('click', () => setMotion(!motionEnabled));
reducedMotion.addEventListener('change', (event) => setMotion(!event.matches));
setMotion(motionEnabled);
updateScene();
