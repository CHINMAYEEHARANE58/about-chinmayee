import { projects, earlierProjects } from './data/projects.js';
import { moreWebProjects } from './data/more-projects.js';

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
  sentinelops: './assets/projects/sentinelops.jpg',
  gigx: './assets/projects/gigx.png',
};

const groups = [
  { title: 'Platforms', subtitle: 'Full-stack ideas made tangible', items: ['teamflow', 'grabapass', 'gigx', 'splitstream'] },
  { title: 'AI & ideas', subtitle: 'Experiments with useful intelligence', items: ['closetai', 'documind', 'internagent', 'Skillora', 'Vera merchant bot'] },
  { title: 'Systems', subtitle: 'Data, security, and reliable workflows', items: ['stockpilot', 'sentinelops', 'careconnect', 'ClubChain'] },
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
  const image = art[project.slug];
  return image ? `<img src="${esc(image)}" alt="Preview of ${esc(project.title)}">` : `<span>${esc(project.title)}</span>`;
}

function renderWorks() {
  const track = $('#worksTrack');
  track.innerHTML = groups.map((group, groupIndex) => {
    const first = allItems[group.items[0]];
    const rows = group.items.map((key) => {
      const project = allItems[key];
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
let scheduled = false;

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
      const smooth = t * t * (3 - 2 * t);
      return Object.fromEntries(['zoom', 'ax', 'ay', 'tx', 'ty'].map((key) => [key, mix(a[key], b[key], smooth)]));
    }
  }
  return frames.at(-1);
}

function paint() {
  scheduled = false;
  const vh = window.innerHeight, vw = window.innerWidth, scroll = window.scrollY;
  const workTop = works.getBoundingClientRect().top + scroll;
  const workHeight = (groups.length + 1) * vh;
  works.style.height = `${workHeight}px`;
  const workProgress = clamp((scroll - workTop - vh) / Math.max(1, (groups.length - 1) * vh));
  const frame = interpolateCamera(scroll, keyframes(vh));
  const baseHeight = vh * (vw < 600 ? 1.4 : 1.82);
  const baseWidth = baseHeight * 2 / 3;
  camera.style.width = `${baseWidth}px`;
  camera.style.height = `${baseHeight}px`;
  const zoom = vw < 600 ? Math.min(frame.zoom, 1.7) : frame.zoom;
  const tx = vw * (vw < 600 ? (scroll < workTop ? .5 : .22) : frame.tx) - frame.ax * baseWidth * zoom + (motionOn ? pointerX * 12 : 0);
  const ty = vh * frame.ty - frame.ay * baseHeight * zoom + (motionOn ? pointerY * 8 : 0);
  camera.style.transform = `translate3d(${tx}px,${ty}px,0) scale(${zoom})`;

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
window.addEventListener('pointermove', (event) => { pointerX = event.clientX / window.innerWidth - .5; pointerY = event.clientY / window.innerHeight - .5; if (motionOn) schedulePaint(); }, { passive: true });
function setMotion(value) { motionOn = value; document.body.classList.toggle('motion-off', !value); $('#motionToggle').textContent = `MOTION ${value ? 'ON' : 'OFF'}`; $('#motionToggle').setAttribute('aria-pressed', String(value)); schedulePaint(); }
$('#motionToggle').addEventListener('click', () => setMotion(!motionOn));
reducedMotion.addEventListener('change', (event) => setMotion(!event.matches));
renderWorks();
setMotion(motionOn);
