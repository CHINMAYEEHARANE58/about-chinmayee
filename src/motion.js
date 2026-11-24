const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const mix = (a, b, t) => a + (b - a) * t;

const CAMERA = { settleMs: 115, catchUpMs: 55, mobileCloseZoom: 2.05, desktopCloseZoom: 3.35 };
const CAT = { width: 68, height: 63, delayMs: 190, restMs: 420, followMs: 165, maxSpeed: 1.15 };

// React owns the sections and controls. This one RAF loop owns the camera, scene,
// gallery progress, and cat transforms so scroll and pointer handlers never compete.
export function startPortfolioMotion({ panelCount, motionOn: initialMotionOn, setMotionOn }) {
  const stage = document.querySelector('#sceneStage');
  const camera = document.querySelector('#characterCamera');
  const frontFrame = camera.querySelector('.character-frame.front');
  const sideFrame = camera.querySelector('.character-frame.side');
  const backFrame = camera.querySelector('.character-frame.back');
  const sceneLight = stage.querySelector('.scene-light');
  const cat = document.querySelector('#cursorCat');
  const rail = document.querySelector('#resumeRail');
  const chrome = document.querySelector('#heroChrome');
  const track = document.querySelector('#worksTrack');
  const progressLine = document.querySelector('#worksProgress');
  const heroCopy = document.querySelector('.hero-copy');
  const works = document.querySelector('#work');
  const entries = [...document.querySelectorAll('.resume-entry')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let motionOn = initialMotionOn;
  let catActive = false;
  let catX = 0, catY = 0, catTargetX = 0, catTargetY = 0;
  let lastChaseMove = 0;
  const catTrail = [];
  let cameraScroll = window.scrollY;
  let lastFrameTime = performance.now();
  let animationFrame = 0;
  let shots = [];
  let workTop = 0;
  let workHeight = 0;
  let destroyed = false;

  function schedulePaint() {
    if (!destroyed && !animationFrame) animationFrame = requestAnimationFrame(paint);
  }

  function hideCat() {
    catActive = false;
    catTrail.length = 0;
    cat.classList.remove('is-visible', 'is-running');
  }

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
    const resumeTop = top(document.querySelector('#resume'));
    const educationTop = top(entries[0]);
    const nextTop = top(entries[1]);
    const nykaaTop = top(entries[2]);
    const buildingTop = top(entries[3]);
    const workTop = top(works);
    const shot = (at, zoom, ax, ay, tx, ty, side = 0, focus = 0) => ({ at, zoom, ax, ay, tx, ty, side, focus });
    return [
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
    ].sort((a, b) => a.at - b.at);
  }

  function measureScene() {
    const stackedWorks = window.innerWidth <= 700;
    works.style.height = stackedWorks ? 'auto' : `${(panelCount + 1) * window.innerHeight}px`;
    workHeight = works.offsetHeight;
    workTop = works.getBoundingClientRect().top + window.scrollY;
    shots = keyframes(window.innerHeight);
  }

  function interpolateCamera(scroll) {
    if (scroll <= shots[0].at) return shots[0];
    for (let index = 0; index < shots.length - 1; index++) {
      const a = shots[index], b = shots[index + 1];
      if (scroll <= b.at) {
        const t = clamp((scroll - a.at) / Math.max(1, b.at - a.at));
        const eased = t * t * (3 - 2 * t);
        return Object.fromEntries(['zoom', 'ax', 'ay', 'tx', 'ty', 'side', 'focus'].map((key) => [key, mix(a[key], b[key], eased)]));
      }
    }
    return shots.at(-1);
  }

  function paint() {
    animationFrame = 0;
    const vh = window.innerHeight, vw = window.innerWidth, scroll = window.scrollY;
    const now = performance.now();
    const dt = Math.min(Math.max(now - lastFrameTime, 1), 80);
    lastFrameTime = now;
    const lag = Math.abs(scroll - cameraScroll) / vh;
    const duration = mix(CAMERA.settleMs, CAMERA.catchUpMs, clamp((lag - .12) / .8));
    const cameraAlpha = motionOn ? 1 - Math.exp(-dt / duration) : 1;
    cameraScroll = mix(cameraScroll, scroll, cameraAlpha);
    if (Math.abs(cameraScroll - scroll) > .25) schedulePaint();
    const stackedWorks = vw <= 700;
    const workProgress = stackedWorks
      ? clamp((scroll - workTop) / Math.max(1, workHeight - vh))
      : clamp((scroll - workTop - vh) / Math.max(1, (panelCount - 1) * vh));
    const frame = motionOn ? interpolateCamera(cameraScroll) : shots[0];
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
    track.style.transform = stackedWorks ? '' : `translate3d(${-workProgress * (panelCount - 1) * (vw * (vw < 900 ? .74 : .66))}px,0,0)`;
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

  function onResize() { measureScene(); hideCat(); schedulePaint(); }
  function onPointerMove(event) {
    if (event.pointerType !== 'mouse' || !motionOn) { hideCat(); return; }
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
  }
  function onPointerOut(event) { if (event.pointerType === 'mouse' && !event.relatedTarget) hideCat(); }
  function onPreferenceChange(event) { setMotionOn(!event.matches); }
  function setMotion(value) {
    motionOn = value;
    document.body.classList.toggle('motion-off', !value);
    if (!value) hideCat();
    schedulePaint();
  }

  window.addEventListener('scroll', schedulePaint, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerout', onPointerOut, { passive: true });
  window.addEventListener('blur', hideCat);
  reducedMotion.addEventListener('change', onPreferenceChange);
  measureScene();
  document.fonts?.ready.then(() => { if (!destroyed) { measureScene(); schedulePaint(); } });
  setMotion(initialMotionOn);

  return {
    setMotion,
    destroy() {
      destroyed = true;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', schedulePaint);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerout', onPointerOut);
      window.removeEventListener('blur', hideCat);
      reducedMotion.removeEventListener('change', onPreferenceChange);
      document.body.classList.remove('motion-off');
    },
  };
}
