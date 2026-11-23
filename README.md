# About Chinmayee

A visual portfolio inspired by the scroll-led composition of [About Sen](https://about.senbuzy.com/). Its source code is MIT licensed; the original character and other personal assets are excluded by the creator's [NOTICE](https://github.com/dayinji/sen-3d-resume/blob/main/NOTICE). This project uses new artwork based on Chinmayee's supplied photo, her résumé, and her own portfolio and GitHub repositories.

## Run locally

```sh
npm install
npm run build
npm run preview -- --port 5173
```

Open `http://localhost:5173`.

For editing with hot reload, use `npm run dev -- --port 5173`. Vite writes the deployable static site to `dist/`.

## Content and motion

`src/App.jsx` renders Chinmayee's biography, education, experience, skills, hobbies, projects, and contact links as React components. The hobbies section covers dancing, art and craft, content creation, open source contribution, public speaking, trekking, and traveling. The 12 case studies in `data/projects.js` and 10 additional GitHub projects in `data/more-projects.js` were adapted from her `Portfolio` repository, which also supplied selected project screenshots. The résumé download and character art live in `public/`.

`src/motion.js` drives the scroll camera, the horizontal works gallery, and the cursor cat through one animation loop. React owns the project previews, detail dialogs, and motion toggle. The character consists of matching front, side, and rear raster views. It approximates the reference's camera movement; it is not a rigged 3D model and cannot reproduce its exact geometry.
