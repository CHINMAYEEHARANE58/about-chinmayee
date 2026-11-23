import { useEffect, useRef, useState } from 'react';
import { githubContributions } from '../data/contributions.js';
import { allProjects, hobbies, projectArt, projectGroups, resumeEntries, skills } from './content.js';
import { startPortfolioMotion } from './motion.js';

const validUrl = (url) => typeof url === 'string' && /^https:\/\//.test(url);

function ProjectPreview({ project }) {
  const image = projectArt[project.slug] || projectArt[project.title];
  return image ? (
    <img src={image} alt={`Front page preview of ${project.title}`} />
  ) : (
    <div className="project-cover">
      <span>SELECTED PROJECT</span>
      <strong>{project.title}</strong>
      <small>{project.category?.[0] || 'Portfolio project'}</small>
    </div>
  );
}

function WorkPanel({ group, index, onSelect }) {
  const [previewKey, setPreviewKey] = useState(group.items[0]);
  return (
    <section className="works-panel" aria-label={group.title}>
      <span className="panel-number">0{index + 1}</span>
      <h3>{group.title}</h3>
      <p className="panel-subtitle">{group.subtitle}</p>
      <div className="panel-preview" aria-hidden="true"><ProjectPreview project={allProjects[previewKey]} /></div>
      <ul className="project-list">
        {group.items.map((key) => {
          const project = allProjects[key];
          const label = project.status ?? project.note ?? project.category?.[0] ?? 'Project';
          return (
            <li key={key}>
              <button type="button" aria-label={`View ${project.title} details`}
                onMouseEnter={() => setPreviewKey(key)} onFocus={() => setPreviewKey(key)}
                onClick={() => onSelect(project)}>
                <span>{project.title}</span><small>{label}</small>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function DetailList({ title, items }) {
  return items?.length ? <><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></> : null;
}

function ProjectDialog({ project, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!project) return;
    dialog.showModal();
    document.body.classList.add('dialog-open');
    return () => {
      if (dialog.open) dialog.close();
      document.body.classList.remove('dialog-open');
    };
  }, [project]);

  const links = project ? [['GitHub', project.github], ['Live site', project.demo]].filter(([, url]) => validUrl(url)) : [];
  return (
    <dialog ref={dialogRef} id="projectDialog" className="project-dialog" aria-labelledby="dialogTitle"
      onClose={onClose} onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current.close(); }}>
      <button className="dialog-close" type="button" aria-label="Close project details" onClick={() => dialogRef.current?.close()}>×</button>
      {project && <div className="dialog-inner">
        <div className="dialog-cover"><ProjectPreview project={project} /></div>
        <span className="dialog-eyebrow">{(project.category || []).join(' · ') || 'PROJECT'}{project.status ? ` · ${project.status}` : ''}</span>
        <h2 id="dialogTitle">{project.title}</h2>
        {project.subtitle && <p className="dialog-subtitle">{project.subtitle}</p>}
        <p>{project.summary}</p>
        {[
          ['The idea', project.problem], ['Approach', project.approach], ['How it works', project.architecture],
        ].filter(([, value]) => value).map(([title, value]) => <div key={title}><h3>{title}</h3><p>{value}</p></div>)}
        <DetailList title="What it includes" items={project.features} />
        <DetailList title="Challenges" items={project.challenges} />
        <DetailList title="What I learned" items={project.learnings} />
        <DetailList title="Next steps" items={project.planned} />
        <div className="dialog-tags">{(project.stack || []).map((tag) => <span key={tag}>{tag}</span>)}</div>
        <div className="dialog-links">{links.map(([label, url]) => <a key={label} href={url} target="_blank" rel="noopener noreferrer">{label} ↗</a>)}</div>
      </div>}
    </dialog>
  );
}

function Contributions() {
  const { start, end, total, levels } = githubContributions;
  const firstDay = new Date(`${start}T12:00:00Z`);
  return (
    <section className="contributions-section" id="contributions" aria-labelledby="contributionsTitle">
      <div className="contributions-heading"><div><span className="section-overline">BUILDING IN THE OPEN</span><h2 id="contributionsTitle">A year in <em>green.</em></h2></div>
        <p><strong id="contributionCount">{total}</strong> GitHub contributions in the year shown. <a href="https://github.com/CHINMAYEEHARANE58" target="_blank" rel="noopener noreferrer">See the live profile ↗</a></p>
      </div>
      <div className="contributions-card"><div className="contributions-card-top"><span>GITHUB ACTIVITY</span><span id="contributionPeriod">{start} to {end}</span></div>
        <div className="contributions-scroll"><div className="contributions-grid" id="contributionGrid" aria-hidden="true">
          {[...levels].map((level, index) => {
            const date = new Date(firstDay);
            date.setUTCDate(firstDay.getUTCDate() + index);
            const day = date.toISOString().slice(0, 10);
            return <span key={day} className={`contribution-day level-${level}`} title={`${day}: GitHub activity level ${level} of 4`} />;
          })}
        </div></div>
        <div className="contributions-foot"><span>Snapshot from GitHub, 23 Nov 2026</span><div className="contributions-legend" aria-label="Less to more activity"><span>LESS</span>{[0, 1, 2, 3, 4].map((level) => <i key={level} className={`level-${level}`} />)}<span>MORE</span></div></div>
      </div>
    </section>
  );
}

export default function App() {
  const [motionOn, setMotionOn] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [selectedProject, setSelectedProject] = useState(null);
  const motionRef = useRef(null);

  useEffect(() => {
    motionRef.current = startPortfolioMotion({ panelCount: projectGroups.length, motionOn, setMotionOn });
    return () => { motionRef.current?.destroy(); motionRef.current = null; };
  }, []);
  useEffect(() => { motionRef.current?.setMotion(motionOn); }, [motionOn]);

  return <>
    <a className="skip-link" href="#about">Skip to content</a>
    <div className="scene-stage" id="sceneStage" aria-hidden="true"><div className="scene-light" />
      <div className="character-camera" id="characterCamera">
        <div className="character-frame front"><img src="./assets/chinmayee-front.png" alt="" /></div>
        <div className="character-frame side"><img src="./assets/chinmayee-side.png" alt="" /></div>
        <img className="character-frame back" src="./assets/chinmayee-back.png" alt="" />
      </div><div className="scene-shade" />
    </div>
    <div className="resume-rail" id="resumeRail" aria-hidden="true" /><div className="film-grain" aria-hidden="true" />
    <div className="cursor-cat" id="cursorCat" aria-hidden="true"><div className="cursor-cat-body">
      <img className="cat-sit" src="./assets/cursor-cat-sit.png" alt="" />
      <img className="cat-run" src="./assets/cursor-cat-run.png" alt="" />
      <img className="cat-run-b" src="./assets/cursor-cat-run-b.png" alt="" />
    </div></div>
    <div className="hero-chrome" id="heroChrome" aria-hidden="true"><div className="frame-outline" />
      <span className="cross cross-tl">+</span><span className="cross cross-tr">+</span><span className="cross cross-bl">+</span><span className="cross cross-br">+</span>
      <div className="chrome-meta chrome-tl"><strong>Chinmayee Harane</strong><span>SOFTWARE ENGINEER</span></div>
      <div className="chrome-meta chrome-tr">PORTFOLIO — 2026</div><div className="chrome-meta chrome-bl">CODE · DESIGN · CURIOSITY</div><div className="chrome-meta chrome-right">BASED IN PUNE, INDIA</div>
    </div>
    <header className="site-controls">
      <a className="github-control" href="https://github.com/CHINMAYEEHARANE58" target="_blank" rel="noopener noreferrer" aria-label="Chinmayee on GitHub" title="GitHub">GH</a>
      <a className="resume-control" href="./resume/Chinmayee_Harane_Resume.pdf" target="_blank" rel="noopener noreferrer">RÉSUMÉ</a>
      <button className="motion-control" id="motionToggle" type="button" aria-pressed={motionOn} onClick={() => setMotionOn((current) => !current)}>MOTION {motionOn ? 'ON' : 'OFF'}</button>
    </header>
    <main>
      <section className="hero" id="about" aria-labelledby="heroTitle"><div className="hero-copy">
        <h1 id="heroTitle">About Chinmayee</h1>
        <p>I build software with a plot twist: playful enough to make you look twice, engineered well enough to trust on the second look. From full-stack products to security puzzles, I turn improbable ideas into things you can actually use.</p>
        <a className="scroll-cue" href="#resume"><span>SCROLL</span><i /></a>
      </div></section>
      <section className="resume-section" id="resume" aria-labelledby="resumeTitle"><h2 className="resume-title" id="resumeTitle">Résumé</h2><div className="resume-timeline">
        {resumeEntries.map((entry) => <article key={entry.focus} className="resume-entry" data-focus={entry.focus}><span className="time-label">{entry.time}</span><h3>{entry.title}</h3><p className="role">{entry.role}</p><p>{entry.description}</p></article>)}
      </div></section>
      <section className="works-section" id="work" aria-labelledby="worksTitle"><div className="works-sticky"><h2 id="worksTitle" className="works-title">Works</h2>
        <div className="works-track" id="worksTrack">{projectGroups.map((group, index) => <WorkPanel key={group.title} group={group} index={index} onSelect={setSelectedProject} />)}</div>
        <div className="works-progress"><div className="works-progress-line"><span id="worksProgress" /></div><span>KEEP SCROLLING</span></div>
      </div></section>
      <section className="skills-section" id="skills" aria-labelledby="skillsTitle"><div className="section-overline">A FEW THINGS IN MY TOOLBOX</div><h2 id="skillsTitle">Skills & <em>curiosities.</em></h2>
        <div className="skills-grid">{skills.map(([title, description], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
        <div className="highlights"><p><strong>Twice shortlisted</strong> for the Smart India Hackathon.</p><p>Former technical team member, Microsoft Learn Student Club. Trek leader, MIT Adventure Club.</p></div>
      </section>
      <Contributions />
      <section className="hobbies-section" id="hobbies" aria-labelledby="hobbiesTitle"><div className="hobbies-heading"><div><span className="section-overline">BEYOND THE SCREEN</span><h2 id="hobbiesTitle">Outside the <em>code.</em></h2></div><p>Dancing, making, sharing ideas, and finding new places to explore are all part of who I am.</p></div>
        <ul className="hobbies-grid">{hobbies.map(([icon, title, description], index) => <li key={title} className="hobby-card"><span className="hobby-icon" aria-hidden="true">{icon}</span><span className="hobby-number">0{index + 1} / 07</span><h3>{title}</h3><p>{description}</p></li>)}</ul>
      </section>
      <section className="contact-section" id="contact" aria-labelledby="contactTitle"><span className="section-overline">SAY HELLO</span><h2 id="contactTitle">Let’s make<br /><em>something good.</em></h2><p>I’m always curious about interesting products, thoughtful teams, and new challenges.</p>
        <a className="email-link" href="mailto:chinmayeeharane20@gmail.com">chinmayeeharane20@gmail.com</a>
        <nav className="social-links" aria-label="Social links"><a href="https://github.com/CHINMAYEEHARANE58" target="_blank" rel="noopener noreferrer">GitHub</a><a href="https://www.linkedin.com/in/chinmayee-harane-568896287/" target="_blank" rel="noopener noreferrer">LinkedIn</a><a href="https://leetcode.com/u/chinmayeeharane/" target="_blank" rel="noopener noreferrer">LeetCode</a><a href="./resume/Chinmayee_Harane_Resume.pdf" target="_blank" rel="noopener noreferrer">Résumé</a></nav>
        <div className="contact-foot"><span>© 2026 CHINMAYEE HARANE</span><a href="#about">BACK TO TOP ↑</a></div>
      </section>
    </main>
    <ProjectDialog project={selectedProject} onClose={() => setSelectedProject(null)} />
  </>;
}
