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
const eyeLayers = {
  front: {
    original: './assets/chinmayee-front.png', blank: './assets/chinmayee-front-gaze.png',
    eyes: [
      { name: 'left', x: 505, y: 219, rx: 12, ry: 11, window: 'M486 217 C497 211 514 211 528 221 C517 228 498 229 486 217 Z' },
      { name: 'right', x: 585, y: 226, rx: 11, ry: 10, window: 'M570 225 C580 218 596 218 607 228 C597 235 579 235 570 225 Z' },
    ],
  },
  side: {
    original: './assets/chinmayee-side.png', blank: './assets/chinmayee-side-gaze.png',
    eyes: [
      { name: 'left', x: 536, y: 216, rx: 12, ry: 11, window: 'M516 216 C525 209 545 208 559 219 C547 227 527 227 516 216 Z' },
      { name: 'right', x: 611, y: 216, rx: 11, ry: 10, window: 'M592 216 C600 209 617 208 629 217 C618 224 601 224 592 216 Z' },
    ],
  },
};
for (const [view, layer] of Object.entries(eyeLayers)) {
  const rig = camera.querySelector(`[data-eye-view="${view}"]`);
  const defs = layer.eyes.map((eye) => `<clipPath id="${view}-${eye.name}-eye"><path d="${eye.window}"/></clipPath><clipPath id="${view}-${eye.name}-iris"><ellipse cx="${eye.x}" cy="${eye.y}" rx="${eye.rx}" ry="${eye.ry}"/></clipPath>`).join('');
  const eyes = layer.eyes.map((eye) => `<g clip-path="url(#${view}-${eye.name}-eye)"><image href="${layer.blank}" width="1024" height="1536" clip-path="url(#${view}-${eye.name}-iris)"/><g class="iris-mover"><image href="${layer.original}" width="1024" height="1536" clip-path="url(#${view}-${eye.name}-iris)"/></g></g>`).join('');
  rig.innerHTML = `<defs>${defs}</defs>${eyes}`;
}
const eyeMovers = [...camera.querySelectorAll('.iris-mover')];
const rail = $('#resumeRail');
const chrome = $('#heroChrome');
const track = $('#worksTrack');
const progressLine = $('#worksProgress');
const heroCopy = $('.hero-copy');
const works = $('#work');
const entries = [...document.querySelectorAll('.resume-entry')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionOn = !reducedMotion.matches;
let pointerX = 0;
let pointerY = 0;
let cursorX = 0;
let cursorY = 0;
let hasPointer = false;
let gazeX = 0;
let gazeY = 0;
let lastGazeTime = 0;
let cameraScroll = window.scrollY;
let lastCameraTime = 0;
let scheduled = false;

function paintGaze(faceX, faceY, vw, vh) {
  const targetX = motionOn && hasPointer ? Math.tanh((cursorX - faceX) / (vw * .31)) * 4 : 0;
  const targetY = motionOn && hasPointer ? Math.tanh((cursorY - faceY) / (vh * .36)) * 1.8 : 0;
  const now = performance.now();
  const alpha = motionOn ? 1 - Math.exp(-Math.min(now - lastGazeTime || 16, 64) / 75) : 1;
  lastGazeTime = now;
  gazeX = mix(gazeX, targetX, alpha);
  gazeY = mix(gazeY, targetY, alpha);
  const offset = `translate(${gazeX.toFixed(2)} ${gazeY.toFixed(2)})`;
  for (const eye of eyeMovers) eye.setAttribute('transform', offset);
  if (Math.abs(gazeX - targetX) + Math.abs(gazeY - targetY) > .025) schedulePaint();
}

function keyframes(viewportHeight) {
  const top = (element) => element.getBoundingClientRect().top + window.scrollY;
  const scene = [
    { at: 0, zoom: 1, ax: .5, ay: .18, tx: .5, ty: .3 },
    { at: top($('#resume')) - viewportHeight * .05, zoom: 1.3, ax: .5, ay: .18, tx: .43, ty: .42 },
    { at: top(entries[0]) - viewportHeight * .34, zoom: 2.3, ax: .56, ay: .15, tx: .28, ty: .5 },
    { at: top(entries[1]) - viewportHeight * .34, zoom: 3.05, ax: .43, ay: .17, tx: .25, ty: .5 },
    { at: top(entries[2]) - viewportHeight * .34, zoom: 3.4, ax: .55, ay: .15, tx: .27, ty: .51 },
    { at: top(entries[3]) - viewportHeight * .34, zoom: 2.45, ax: .5, ay: .2, tx: .27, ty: .46 },
    { at: top(works) - viewportHeight * .25, zoom: 1.25, ax: .5, ay: .17, tx: .18, ty: .44 },
  ];
  return scene.sort((a, b) => a.at - b.at);
}

function interpolateCamera(scroll, frames) {
  if (scroll <= frames[0].at) return frames[0];
  for (let i = 0; i < frames.length - 1; i++) {
    const a = frames[i], b = frames[i + 1];
    if (scroll <= b.at) {
      const t = clamp((scroll - a.at) / Math.max(1, b.at - a.at));
      return Object.fromEntries(['zoom', 'ax', 'ay', 'tx', 'ty'].map((key) => [key, mix(a[key], b[key], t)]));
    }
  }
  return frames.at(-1);
}

function paint() {
  scheduled = false;
  const vh = window.innerHeight, vw = window.innerWidth, scroll = window.scrollY;
  const now = performance.now();
  const cameraAlpha = motionOn ? 1 - Math.exp(-Math.min(now - lastCameraTime || 16, 64) / 105) : 1;
  lastCameraTime = now;
  cameraScroll = mix(cameraScroll, scroll, cameraAlpha);
  if (Math.abs(cameraScroll - scroll) > .4) schedulePaint();
  const workTop = works.getBoundingClientRect().top + scroll;
  const workHeight = (groups.length + 1) * vh;
  works.style.height = `${workHeight}px`;
  const workProgress = clamp((scroll - workTop - vh) / Math.max(1, (groups.length - 1) * vh));
  const frame = interpolateCamera(cameraScroll, keyframes(vh));
  const baseHeight = vh * (vw < 600 ? 1.4 : 1.82);
  const baseWidth = baseHeight * 2 / 3;
  camera.style.width = `${baseWidth}px`;
  camera.style.height = `${baseHeight}px`;
  const zoom = vw < 600 ? Math.min(frame.zoom, 1.7) : frame.zoom;
  const tx = vw * (vw < 600 ? (scroll < workTop ? .5 : .22) : frame.tx) - frame.ax * baseWidth * zoom + (motionOn ? pointerX * 12 : 0);
  const ty = vh * frame.ty - frame.ay * baseHeight * zoom + (motionOn ? pointerY * 8 : 0);
  camera.style.transform = `translate3d(${tx}px,${ty}px,0) scale(${zoom})`;
  paintGaze(tx + baseWidth * zoom * (546 / 1024), ty + baseHeight * zoom * (222 / 1536), vw, vh);

  const heroFade = clamp(scroll / (vh * .45));
  heroCopy.style.opacity = String(1 - heroFade);
  heroCopy.style.filter = `blur(${heroFade * 12}px)`;
  chrome.style.opacity = String(1 - clamp(scroll / 270));
  rail.style.opacity = String(clamp((scroll - vh * .55) / (vh * .45)) * (1 - clamp((scroll - workTop) / (vh * .5))));
  track.style.transform = `translate3d(${-workProgress * (groups.length - 1) * (vw * (vw < 600 ? 1 : vw < 900 ? .74 : .66))}px,0,0)`;
  progressLine.style.width = `${Math.max(1, workProgress * 100)}%`;
  const inWork = scroll >= workTop;
  let front = 1, side = 0, back = 0;
  if (inWork) {
    side = clamp(workProgress * 6) * (1 - clamp((workProgress - .17) * 6));
    back = clamp((workProgress - .14) * 7) * (1 - clamp((workProgress - .56) * 5));
    front = Math.max(0, 1 - side - back);
  }
  $('.character-frame.front').style.opacity = String(front);
  $('.character-frame.side').style.opacity = String(side);
  $('.character-frame.back').style.opacity = String(back);
  const pastWork = clamp((scroll - (workTop + workHeight - vh)) / (vh * .7));
  stage.style.opacity = String(1 - pastWork);
}

function schedulePaint() { if (!scheduled) { scheduled = true; requestAnimationFrame(paint); } }
window.addEventListener('scroll', schedulePaint, { passive: true });
window.addEventListener('resize', schedulePaint);
window.addEventListener('pointermove', (event) => { cursorX = event.clientX; cursorY = event.clientY; hasPointer = true; pointerX = event.clientX / window.innerWidth - .5; pointerY = event.clientY / window.innerHeight - .5; if (motionOn) schedulePaint(); }, { passive: true });
window.addEventListener('blur', () => { hasPointer = false; schedulePaint(); });
function setMotion(value) { motionOn = value; document.body.classList.toggle('motion-off', !value); $('#motionToggle').textContent = `MOTION ${value ? 'ON' : 'OFF'}`; $('#motionToggle').setAttribute('aria-pressed', String(value)); schedulePaint(); }
$('#motionToggle').addEventListener('click', () => setMotion(!motionOn));
reducedMotion.addEventListener('change', (event) => setMotion(!event.matches));
renderWorks();
renderContributions();
setMotion(motionOn);
