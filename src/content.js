import { projects, earlierProjects } from '../data/projects.js';
import { moreWebProjects } from '../data/more-projects.js';

export const projectArt = {
  teamflow: './assets/projects/teamflow.png',
  stockpilot: './assets/projects/stockpilot.jpg',
  sentinelops: './assets/projects/sentinelops-home.jpg',
  gigx: './assets/projects/gigx-home.jpg',
  splitstream: './assets/projects/splitstream.jpg',
  finsight: './assets/projects/finsight.jpg',
  'Happy Teeth': './assets/projects/happy-teeth.jpg',
};

export const projectGroups = [
  { title: 'Platforms', subtitle: 'Full-stack ideas made tangible', items: ['teamflow', 'grabapass', 'gigx', 'splitstream'] },
  { title: 'AI & ideas', subtitle: 'Experiments with useful intelligence', items: ['closetai', 'documind', 'internagent', 'Skillora', 'Vera merchant bot'] },
  { title: 'Systems', subtitle: 'Data, security, and reliable workflows', items: ['stockpilot', 'sentinelops', 'careconnect', 'ClubChain'] },
  { title: 'Cloud & bots', subtitle: 'Recent prototypes and learning labs', items: ['Magicpin Vera Bot', 'CloudNotes Release Lab', 'CloudNotes Infra Lab'] },
  { title: 'Interfaces', subtitle: 'Web and mobile experiences', items: ['finsight', 'smart-library-manager', 'Happy Teeth', 'Plate Poetry React', 'Student progress dashboard'] },
  { title: 'More work', subtitle: 'Curiosity in many directions', items: ['Library Management System', 'Game collection', 'Instagram clone', 'React Quiz'] },
  { title: 'Earlier builds', subtitle: 'Small projects and first experiments', items: earlierProjects.map((project) => project.title) },
];

export const allProjects = Object.fromEntries([
  ...projects.map((project) => [project.slug, project]),
  ...moreWebProjects.map((project) => [project.title, project]),
  ...earlierProjects.map((project) => [project.title, {
    title: project.title,
    summary: 'An earlier portfolio project.',
    demo: project.url,
    stack: [],
    category: ['Earlier work'],
  }]),
]);

export const resumeEntries = [
  {
    focus: 'education', time: '2023 – 2027', title: 'MIT ADT University · Pune',
    role: 'B.Tech in Computer Science · Kalvium Software Product Engineering',
    description: 'Building a foundation in software engineering, problem solving, and product development.',
  },
  {
    focus: 'icliniq', time: 'MAR 2025 – JAN 2026', title: 'iCliniq', role: 'Tech Intern · Healthcare platform',
    description: 'Contributed frontend and backend features to a live product. Worked with React, TypeScript, Node.js, GraphQL, Directus, and REST APIs; debugged production issues and improved user-facing flows.',
  },
  {
    focus: 'nykaa', time: 'AUG 2026 – NOW', title: 'Nykaa', role: 'Cyber Security Intern',
    description: 'Learning across data loss prevention, governance and compliance, application security, security operations, and cloud security.',
  },
  {
    focus: 'building', time: 'ALWAYS BUILDING', title: 'Projects & experiments', role: 'Full stack · Data · Security · Mobile',
    description: 'From event ticketing and collaborative workspaces to document search and mobile scheduling, I enjoy learning by making.',
  },
];

export const skills = [
  ['Build', 'React · Angular · TypeScript · Node.js · Express · FastAPI · Rust / Axum · GraphQL'],
  ['Data', 'PostgreSQL · MongoDB · Firebase · Snowflake · Kafka · Airflow · PySpark'],
  ['Secure', 'DLP · GRC · OWASP Top 10 · Burp Suite · Kali Linux · Cloud security fundamentals'],
  ['Explore', 'Flutter · UI/UX · Docker · AWS · C++ · Python · Java · systems thinking'],
];

export const hobbies = [
  ['✳', 'Dancing', 'Finding joy in movement.'],
  ['✂', 'Art & craft', 'Making things with my hands.'],
  ['✦', 'Content creation', 'Sharing ideas through stories and visuals.'],
  ['{ }', 'Open source contribution', 'Building in the open with others.'],
  ['◎', 'Public speaking', 'Turning ideas into conversations.'],
  ['↟', 'Trekking', 'Taking the scenic route on foot.'],
  ['✈', 'Traveling', 'Discovering new places and perspectives.'],
];
