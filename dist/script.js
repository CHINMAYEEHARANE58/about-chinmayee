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
const eyeLayouts = {
  front: [[507, 218, 22, 11], [585, 224, 21, 10]],
  side: [[536, 215, 21, 11], [611, 216, 19, 10]],
  low: [[509, 177, 22, 10], [586, 194, 20, 10]],
};
function eyeRig(view, layout) {
  const eyes = eyeLayouts[layout];
  return `<svg class="eye-rig" viewBox="0 0 1024 1536" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="${view}-iris-gradient"><stop offset="0" stop-color="#24150f"/><stop offset=".42" stop-color="#4d2a1b"/><stop offset=".82" stop-color="#85543a"/><stop offset="1" stop-color="#3b241c"/></radialGradient>
      ${eyes.map(([x,y,rx,ry], i) => `<clipPath id="${view}-eye-${i}"><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/></clipPath>`).join('')}
    </defs>
    ${eyes.map(([x,y], i) => `<g clip-path="url(#${view}-eye-${i})"><g class="iris" data-mirrored="${view.endsWith('mirror')}"><circle cx="${x}" cy="${y}" r="12.2" fill="url(#${view}-iris-gradient)"/><circle cx="${x}" cy="${y}" r="5.4" fill="#211714"/><circle cx="${x-4.3}" cy="${y-4.4}" r="2.6" fill="#fff6e9" opacity=".93"/><circle cx="${x+4}" cy="${y+3.5}" r="1" fill="#e9cfb7" opacity=".68"/></g></g>`).join('')}
  </svg>`;
}
const viewData = [
  ['front', 'chinmayee-front-gaze.png', 'front'],
  ['side', 'chinmayee-side-gaze.png', 'side'],
  ['rear', 'chinmayee-rear-quarter.png'],
  ['back', 'chinmayee-back.png'],
  ['rear-mirror', 'chinmayee-rear-quarter.png'],
  ['side-mirror', 'chinmayee-side-gaze.png', 'side'],
  ['low', 'chinmayee-low-gaze.png', 'low'],
];
camera.innerHTML = `<div class="character-rig" id="characterRig">${viewData.map(([name, asset, eyes]) => `<div class="character-view ${name.endsWith('mirror') ? 'mirrored' : ''}" data-view="${name}"><img src="./assets/${asset}" alt="" draggable="false">${eyes ? eyeRig(name, eyes) : ''}</div>`).join('')}</div>`;
const characterRig = $('#characterRig');
const views = Object.fromEntries([...camera.querySelectorAll('[data-view]')].map((view) => [view.dataset.view, view]));
const irises = [...camera.querySelectorAll('.iris')];
const rail = $('#resumeRail');
const chrome = $('#heroChrome');
const track = $('#worksTrack');
const progressLine = $('#worksProgress');
const heroCopy = $('.hero-copy');
const works = $('#work');
const entries = [...document.querySelectorAll('.resume-entry')];
for (const entry of entries) {
  const card = document.createElement('div');
  card.className = 'resume-card';
  while (entry.firstChild) card.appendChild(entry.firstChild);
  entry.appendChild(card);
}
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionOn = !reducedMotion.matches;
let pointerX = 0;
let pointerY = 0;
let gazeX = 0;
let gazeY = 0;
let scheduled = false;

function keyframes(viewportHeight) {
  const top = (element) => element.getBoundingClientRect().top + window.scrollY;
  const first = top(entries[0]) - viewportHeight * .34;
  const second = top(entries[1]) - viewportHeight * .34;
  const third = top(entries[2]) - viewportHeight * .34;
  const fourth = top(entries[3]) - viewportHeight * .34;
  const work = top(works) - viewportHeight * .2;
  const frame = (at, zoom, ax, ay, tx, ty, angle = 0, low = 0) => ({ at, zoom, ax, ay, tx, ty, angle, low });
  const scene = [
    frame(0, 1, .5, .18, .5, .3),
    frame(top($('#resume')) - viewportHeight * .05, 1.55, .51, .2, .4, .44),
    frame(first, 2.55, .43, .22, .28, .5), // University: left cheek and hair.
    frame(second, 3.55, .49, .22, .25, .53), // Internship: closer to the cheek stickers.
    frame(third, 3.65, .61, .16, .27, .5), // Security: across to the eyes.
    frame(fourth, 3.15, .55, .22, .29, .52, 0, 1), // Projects: low angle at the jaw.
    frame(mix(fourth, work, .35), 1.35, .5, .2, .48, .38), // Pull back to the front.
    frame(mix(fourth, work, .72), 1.4, .5, .2, .28, .4, 95), // Turn past the shoulder.
    frame(work, 1.48, .5, .2, .2, .42, 180), // Back of head before the gallery.
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
      return Object.fromEntries(['zoom', 'ax', 'ay', 'tx', 'ty', 'angle', 'low'].map((key) => [key, mix(a[key], b[key], smooth)]));
    }
  }
  return frames.at(-1);
}

function paintCharacter(angle, low) {
  const stops = [[0, 'front'], [60, 'side'], [120, 'rear'], [180, 'back'], [240, 'rear-mirror'], [300, 'side-mirror'], [360, 'front']];
  const alpha = Object.fromEntries(Object.keys(views).map((name) => [name, 0]));
  const a = clamp(angle, 0, 360);
  for (let i = 0; i < stops.length - 1; i++) {
    if (a <= stops[i + 1][0]) {
      const t = clamp((a - stops[i][0]) / (stops[i + 1][0] - stops[i][0]));
      const blend = clamp((t - .45) / .1);
      const eased = blend * blend * (3 - 2 * blend);
      alpha[stops[i][1]] += 1 - eased;
      alpha[stops[i + 1][1]] += eased;
      break;
    }
  }
  const lowBlend = clamp((low - .82) / .05);
  alpha.front *= 1 - lowBlend;
  alpha.low = lowBlend;
  for (const [name, element] of Object.entries(views)) element.style.opacity = String(alpha[name]);
}

function paintEyes() {
  const targetX = motionOn ? pointerX * 14 : 0;
  const targetY = motionOn ? pointerY * 10 : 0;
  gazeX = mix(gazeX, targetX, .2);
  gazeY = mix(gazeY, targetY, .2);
  for (const iris of irises) iris.setAttribute('transform', `translate(${(iris.dataset.mirrored === 'true' ? -gazeX : gazeX).toFixed(2)} ${gazeY.toFixed(2)})`);
  if (Math.abs(gazeX - targetX) + Math.abs(gazeY - targetY) > .03) schedulePaint();
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
  const zoom = vw < 600 ? frame.zoom * (frame.zoom > 2 ? .85 : 1) : frame.zoom;
  const tx = vw * (vw < 600 ? .5 : frame.tx) - frame.ax * baseWidth * zoom + (motionOn ? pointerX * 8 : 0);
  const ty = vh * frame.ty - frame.ay * baseHeight * zoom + (motionOn ? pointerY * 8 : 0);
  camera.style.transform = `translate3d(${tx}px,${ty}px,0) scale(${zoom})`;
  characterRig.style.transform = `perspective(1500px) rotateX(${(-frame.low * 5).toFixed(2)}deg)`;
  const angle = scroll >= workTop ? 180 + workProgress * 180 : frame.angle;
  paintCharacter(angle, frame.low);
  paintEyes();

  const heroFade = clamp(scroll / (vh * .45));
  heroCopy.style.opacity = String(1 - heroFade);
  heroCopy.style.filter = `blur(${heroFade * 12}px)`;
  chrome.style.opacity = String(1 - clamp(scroll / 270));
  rail.style.opacity = String(clamp((scroll - vh * .55) / (vh * .45)) * (1 - clamp((scroll - workTop) / (vh * .5))));
  track.style.transform = `translate3d(${-workProgress * (groups.length - 1) * (vw * (vw < 600 ? 1 : vw < 900 ? .74 : .66))}px,0,0)`;
  progressLine.style.width = `${Math.max(1, workProgress * 100)}%`;
  const pastWork = clamp((scroll - (workTop + workHeight - vh)) / (vh * .7));
  stage.style.opacity = String(1 - pastWork);
}

function schedulePaint() { if (!scheduled) { scheduled = true; requestAnimationFrame(paint); } }
window.addEventListener('scroll', schedulePaint, { passive: true });
window.addEventListener('resize', schedulePaint);
window.addEventListener('pointermove', (event) => { pointerX = event.clientX / window.innerWidth - .5; pointerY = event.clientY / window.innerHeight - .5; if (motionOn) schedulePaint(); }, { passive: true });
document.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; schedulePaint(); });
window.addEventListener('pointercancel', () => { pointerX = 0; pointerY = 0; schedulePaint(); });
function setMotion(value) { motionOn = value; document.body.classList.toggle('motion-off', !value); $('#motionToggle').textContent = `MOTION ${value ? 'ON' : 'OFF'}`; $('#motionToggle').setAttribute('aria-pressed', String(value)); schedulePaint(); }
$('#motionToggle').addEventListener('click', () => setMotion(!motionOn));
reducedMotion.addEventListener('change', (event) => setMotion(!event.matches));
renderWorks();
setMotion(motionOn);
