import { projects, earlierProjects } from './data/projects.js';
import { moreWebProjects } from './data/more-projects.js?v=20261123';
import { githubContributions } from './data/contributions.js';

const $ = (selector) => document.querySelector(selector);
const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
const mix = (a, b, t) => a + (b - a) * t;
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const validUrl = (url) => typeof url === 'string' && /^https:\/\//.test(url) ? url : null;
const projectBySlug = Object.fromEntries(projects.map((project) => [project.slug, project]));
const moreByTitle = Object.fromEntries(moreWebProjects.map((project) => [project.title, project]));
const art = {
  teamflow: './assets/projects/teamflow.png',
  stockpilot: './assets/projects/stockpilot.jpg',
  sentinelops: './assets/projects/sentinelops-home.jpg',
  gigx: './assets/projects/gigx-home.jpg',
  splitstream: './assets/projects/splitstream.jpg',
  finsight: './assets/projects/finsight.jpg',
  'Happy Teeth': './assets/projects/happy-teeth.jpg',
};

const groups = [
  { title: 'Platforms', subtitle: 'Full-stack ideas made tangible', items: ['teamflow', 'grabapass', 'gigx', 'splitstream'] },
  { title: 'AI & ideas', subtitle: 'Experiments with useful intelligence', items: ['closetai', 'documind', 'internagent', 'Skillora', 'Vera merchant bot'] },
  { title: 'Systems', subtitle: 'Data, security, and reliable workflows', items: ['stockpilot', 'sentinelops', 'careconnect', 'ClubChain'] },
  { title: 'Cloud & bots', subtitle: 'Recent prototypes and learning labs', items: ['Magicpin Vera Bot', 'CloudNotes Release Lab', 'CloudNotes Infra Lab'] },
  { title: 'Interfaces', subtitle: 'Web and mobile experiences', items: ['finsight', 'smart-library-manager', 'Happy Teeth', 'Plate Poetry React', 'Student progress dashboard'] },
  { title: 'More work', subtitle: 'Curiosity in many directions', items: ['Library Management System', 'Game collection', 'Instagram clone', 'React Quiz'] },
  { title: 'Earlier builds', subtitle: 'Small projects and first experiments', items: earlierProjects.map((project) => project.title) },
];

const allItems = Object.fromEntries([
  ...projects.map((p) => [p.slug, p]),
  ...moreWebProjects.map((p) => [p.title, p]),
  ...earlierProjects.map((p) => [p.title, { title: p.title, summary: 'An earlier portfolio project.', demo: p.url, stack: [], category: ['Earlier work'] }]),
]);

function previewContent(project) {
  const image = art[project.slug] || art[project.title];
  if (image) return `<img src="${esc(image)}" alt="Front page preview of ${esc(project.title)}">`;
  return `<div class="project-cover"><span>SELECTED PROJECT</span><strong>${esc(project.title)}</strong><small>${esc(project.category?.[0] || 'Portfolio project')}</small></div>`;
}

function renderContributions() {
  const { start, end, total, levels } = githubContributions;
  const firstDay = new Date(`${start}T12:00:00Z`);
  const cells = [...levels].map((level, index) => {
    const date = new Date(firstDay);
    date.setUTCDate(firstDay.getUTCDate() + index);
    const day = date.toISOString().slice(0, 10);
    return `<span class="contribution-day level-${level}" title="${day}: GitHub activity level ${level} of 4"></span>`;
  }).join('');
  $('#contributionCount').textContent = String(total);
  $('#contributionPeriod').textContent = `${start} to ${end}`;
  $('#contributionGrid').innerHTML = cells;
}

function renderWorks() {
  const track = $('#worksTrack');
  track.innerHTML = groups.map((group, groupIndex) => {
    const first = allItems[group.items[0]];
    const rows = group.items.map((key) => {
      const project = allItems[key];
      if (!project) throw new Error(`Missing project: ${key}`);
      const label = project.status ?? project.note ?? (project.category?.[0] || 'Project');
      return `<li><button type="button" data-project="${esc(key)}" aria-label="View ${esc(project.title)} details"><span>${esc(project.title)}</span><small>${esc(label)}</small></button></li>`;
    }).join('');
    return `<section class="works-panel" aria-label="${esc(group.title)}"><span class="panel-number">0${groupIndex + 1}</span><h3>${esc(group.title)}</h3><p class="panel-subtitle">${esc(group.subtitle)}</p><div class="panel-preview" aria-hidden="true">${previewContent(first)}</div><ul class="project-list">${rows}</ul></section>`;
  }).join('');

  track.querySelectorAll('[data-project]').forEach((button) => {
    const project = allItems[button.dataset.project];
    const preview = button.closest('.works-panel').querySelector('.panel-preview');
    const update = () => { preview.innerHTML = previewContent(project); };
    button.addEventListener('mouseenter', update);
    button.addEventListener('focus', update);
    button.addEventListener('click', () => showProject(project));
  });
}

const dialog = $('#projectDialog');
function showProject(project) {
  const details = [];
  if (project.problem) details.push(['The idea', project.problem]);
  if (project.approach) details.push(['Approach', project.approach]);
  if (project.architecture) details.push(['How it works', project.architecture]);
  if (project.features?.length) details.push(['What it includes', `<ul>${project.features.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`]);
  if (project.challenges?.length) details.push(['Challenges', `<ul>${project.challenges.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`]);
  if (project.learnings?.length) details.push(['What I learned', `<ul>${project.learnings.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`]);
  if (project.planned?.length) details.push(['Next steps', `<ul>${project.planned.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`]);
  const links = [['GitHub', project.github], ['Live site', project.demo]].filter(([, url]) => validUrl(url));
  const category = (project.category || []).join(' · ');
  $('#dialogContent').innerHTML = `<div class="dialog-inner"><div class="dialog-cover">${previewContent(project)}</div><span class="dialog-eyebrow">${esc(category || 'PROJECT')}${project.status ? ` · ${esc(project.status)}` : ''}</span><h2 id="dialogTitle">${esc(project.title)}</h2>${project.subtitle ? `<p class="dialog-subtitle">${esc(project.subtitle)}</p>` : ''}<p>${esc(project.summary)}</p>${details.map(([heading, body]) => `<h3>${esc(heading)}</h3>${body.startsWith('<ul>') ? body : `<p>${esc(body)}</p>`}`).join('')}<div class="dialog-tags">${(project.stack || []).map((tag) => `<span>${esc(tag)}</span>`).join('')}</div><div class="dialog-links">${links.map(([label, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`).join('')}</div></div>`;
  dialog.showModal();
  document.body.classList.add('dialog-open');
}
$('#dialogClose').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));

const stage = $('#sceneStage');
const camera = $('#characterCamera');
const frontFrame = camera.querySelector('.character-frame.front');
const sideFrame = camera.querySelector('.character-frame.side');
const backFrame = camera.querySelector('.character-frame.back');
const sceneLight = camera.parentElement.querySelector('.scene-light');
const CAMERA = { settleMs: 115, catchUpMs: 55, mobileCloseZoom: 2.05, desktopCloseZoom: 3.35 };
const CAT = { width: 68, height: 63, delayMs: 190, restMs: 420, followMs: 165, maxSpeed: 1.15 };
const cat = $('#cursorCat');
const rail = $('#resumeRail');
const chrome = $('#heroChrome');
const track = $('#worksTrack');
const progressLine = $('#worksProgress');
const heroCopy = $('.hero-copy');
const works = $('#work');
const entries = [...document.querySelectorAll('.resume-entry')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionOn = !reducedMotion.matches;
let catActive = false;
let catX = 0, catY = 0, catTargetX = 0, catTargetY = 0;
let lastChaseMove = 0;
const catTrail = [];
let cameraScroll = window.scrollY;
let lastFrameTime = performance.now();
let scheduled = false;
let shots = [];
let workTop = 0;
let workHeight = 0;

function paintCat(dt, now) {
  if (!catActive || !motionOn) return;
  while (catTrail.length && catTrail[0].time <= now - CAT.delayMs) {
    const next = catTrail.shift();
    const direction = next.x - catTargetX;
    if (Math.abs(direction) > 2) cat.style.setProperty('--cat-direction', direction < 0 ? -1 : 1);
    if (Math.hypot(next.x - catTargetX, next.y - catTargetY) > 2) lastChaseMove = now;
    catTargetX = next.x;
    catTargetY = next.y;
  }
  const dx = catTargetX - catX, dy = catTargetY - catY;
  const distance = Math.hypot(dx, dy);
  const easedStep = distance * (1 - Math.exp(-dt / CAT.followMs));
  const step = Math.min(distance, easedStep, dt * CAT.maxSpeed);
  if (distance > .01) { catX += dx / distance * step; catY += dy / distance * step; }
  cat.style.transform = `translate3d(${catX.toFixed(1)}px,${catY.toFixed(1)}px,0)`;
  const running = distance > 2 || now - lastChaseMove < CAT.restMs;
  cat.classList.toggle('is-running', running);
  if (running || catTrail.length) schedulePaint();
}

function keyframes(viewportHeight) {
  const top = (element) => element.getBoundingClientRect().top + window.scrollY;
  const resumeTop = top($('#resume'));
  const educationTop = top(entries[0]);
  const nextTop = top(entries[1]);
  const nykaaTop = top(entries[2]);
  const buildingTop = top(entries[3]);
  const workTop = top(works);
  const shot = (at, zoom, ax, ay, tx, ty, side = 0, focus = 0) => ({ at, zoom, ax, ay, tx, ty, side, focus });
  const scene = [
    shot(0, 1, .5, .18, .5, .3),
    shot(resumeTop - viewportHeight * .35, 1.16, .5, .17, .43, .39),
    shot(educationTop - viewportHeight * .30, 1.42, .52, .16, .36, .42),
    shot(educationTop - viewportHeight * .12, 1.65, .56, .15, .31, .43, 1),
    shot(educationTop + entries[0].offsetHeight * .46 - viewportHeight * .20, 1.65, .56, .15, .31, .43, 1),
    shot(nextTop - viewportHeight * .28, CAMERA.desktopCloseZoom, .56, .14, .27, .43, 1, 1),
    shot(nextTop - viewportHeight * .10, CAMERA.desktopCloseZoom, .56, .14, .27, .43, 1, 1),
    shot(nextTop + viewportHeight * .22, 2.3, .54, .16, .28, .46, 0),
    shot(nykaaTop - viewportHeight * .22, 2.6, .52, .16, .27, .47),
    shot(buildingTop - viewportHeight * .30, 2.35, .5, .2, .27, .46),
    shot(workTop - viewportHeight * .25, 1.25, .5, .17, .18, .44),
  ];
  return scene.sort((a, b) => a.at - b.at);
}

function measureScene() {
  workHeight = (groups.length + 1) * window.innerHeight;
  works.style.height = `${workHeight}px`;
  workTop = works.getBoundingClientRect().top + window.scrollY;
  shots = keyframes(window.innerHeight);
}

function interpolateCamera(scroll, frames) {
  if (scroll <= frames[0].at) return frames[0];
  for (let i = 0; i < frames.length - 1; i++) {
    const a = frames[i], b = frames[i + 1];
    if (scroll <= b.at) {
      const t = clamp((scroll - a.at) / Math.max(1, b.at - a.at));
      const eased = t * t * (3 - 2 * t);
      return Object.fromEntries(['zoom', 'ax', 'ay', 'tx', 'ty', 'side', 'focus'].map((key) => [key, mix(a[key], b[key], eased)]));
    }
  }
  return frames.at(-1);
}

function paint() {
  scheduled = false;
  const vh = window.innerHeight, vw = window.innerWidth, scroll = window.scrollY;
  const now = performance.now();
  const dt = Math.min(Math.max(now - lastFrameTime, 1), 80);
  lastFrameTime = now;
  const lag = Math.abs(scroll - cameraScroll) / vh;
  const duration = mix(CAMERA.settleMs, CAMERA.catchUpMs, clamp((lag - .12) / .8));
  const cameraAlpha = motionOn ? 1 - Math.exp(-dt / duration) : 1;
  cameraScroll = mix(cameraScroll, scroll, cameraAlpha);
  if (Math.abs(cameraScroll - scroll) > .25) schedulePaint();
  const workProgress = clamp((scroll - workTop - vh) / Math.max(1, (groups.length - 1) * vh));
  const frame = motionOn ? interpolateCamera(cameraScroll, shots) : shots[0];
  const baseHeight = vh * (vw < 600 ? 1.4 : 1.82);
  const baseWidth = baseHeight * 2 / 3;
  camera.style.width = `${baseWidth}px`;
  camera.style.height = `${baseHeight}px`;
  const zoom = vw < 600 ? Math.min(frame.zoom, CAMERA.mobileCloseZoom) : frame.zoom;
  const targetX = vw < 600 ? (scroll < workTop ? .5 : .22) : frame.tx;
  const tx = vw * targetX - frame.ax * baseWidth * zoom;
  const targetY = vw < 600 ? mix(frame.ty, .20, frame.side) : frame.ty;
  const ty = vh * targetY - frame.ay * baseHeight * zoom;
  camera.style.transform = `translate3d(${tx}px,${ty}px,0) scale(${zoom})`;
  paintCat(dt, now);
  sceneLight.style.opacity = String(1 - frame.focus * .13);

  const heroFade = clamp(scroll / (vh * .45));
  heroCopy.style.opacity = String(1 - heroFade);
  heroCopy.style.filter = `blur(${heroFade * 12}px)`;
  chrome.style.opacity = String(1 - clamp(scroll / 270));
  rail.style.opacity = String(clamp((cameraScroll - vh * .55) / (vh * .45)) * (1 - clamp((cameraScroll - workTop) / (vh * .5))));
  track.style.transform = `translate3d(${-workProgress * (groups.length - 1) * (vw * (vw < 600 ? 1 : vw < 900 ? .74 : .66))}px,0,0)`;
  progressLine.style.width = `${Math.max(1, workProgress * 100)}%`;
  const inWork = scroll >= workTop;
  let front = 1 - frame.side, side = frame.side, back = 0;
  if (inWork && motionOn) {
    side = clamp(workProgress * 6) * (1 - clamp((workProgress - .17) * 6));
    back = clamp((workProgress - .14) * 7) * (1 - clamp((workProgress - .56) * 5));
    front = Math.max(0, 1 - side - back);
  }
  frontFrame.style.opacity = String(front);
  sideFrame.style.opacity = String(side);
  backFrame.style.opacity = String(back);
  const pastWork = clamp((scroll - (workTop + workHeight - vh)) / (vh * .7));
  stage.style.opacity = String(1 - pastWork);
}

function schedulePaint() { if (!scheduled) { scheduled = true; requestAnimationFrame(paint); } }
window.addEventListener('scroll', schedulePaint, { passive: true });
window.addEventListener('resize', () => { measureScene(); catActive = false; catTrail.length = 0; cat.classList.remove('is-visible'); schedulePaint(); });
window.addEventListener('pointermove', (event) => {
  if (event.pointerType !== 'mouse' || !motionOn) { catActive = false; catTrail.length = 0; cat.classList.remove('is-visible'); return; }
  const x = clamp(event.clientX - CAT.width * .42, 4, window.innerWidth - CAT.width - 4);
  const y = clamp(event.clientY + 12, 4, window.innerHeight - CAT.height - 4);
  if (!catActive) { catX = clamp(x - 42, 4, window.innerWidth - CAT.width - 4); catY = y; catTargetX = catX; catTargetY = catY; catActive = true; lastChaseMove = 0; }
  const now = performance.now();
  const last = catTrail.at(-1);
  if (last && now - last.time < 12) { last.x = x; last.y = y; }
  else catTrail.push({ x, y, time: now });
  if (catTrail.length > 80) catTrail.shift();
  cat.classList.add('is-visible');
  schedulePaint();
}, { passive: true });
document.addEventListener('pointerout', (event) => { if (event.pointerType === 'mouse' && !event.relatedTarget) { catActive = false; catTrail.length = 0; cat.classList.remove('is-visible'); } }, { passive: true });
window.addEventListener('blur', () => { catActive = false; catTrail.length = 0; cat.classList.remove('is-visible'); });
function setMotion(value) { motionOn = value; document.body.classList.toggle('motion-off', !value); $('#motionToggle').textContent = `MOTION ${value ? 'ON' : 'OFF'}`; $('#motionToggle').setAttribute('aria-pressed', String(value)); if (!value) { catActive = false; catTrail.length = 0; cat.classList.remove('is-visible'); } schedulePaint(); }
$('#motionToggle').addEventListener('click', () => setMotion(!motionOn));
reducedMotion.addEventListener('change', (event) => setMotion(!event.matches));
renderWorks();
renderContributions();
measureScene();
document.fonts?.ready.then(() => { measureScene(); schedulePaint(); });
setMotion(motionOn);
