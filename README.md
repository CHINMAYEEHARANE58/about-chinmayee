# About Chinmayee

A visual portfolio inspired by the scroll-led composition of [About Sen](https://about.senbuzy.com/). Its source code is MIT licensed; the original character and other personal assets are excluded by the creator's [NOTICE](https://github.com/dayinji/sen-3d-resume/blob/main/NOTICE). This project uses new artwork based on Chinmayee's supplied photo, her résumé, and her own portfolio and GitHub repositories.

## Run locally

```sh
python3 -m http.server 5173
```

Open `http://localhost:5173`.

## Content and motion

`index.html` contains Chinmayee's biography, education, experience, skills, hobbies, and contact links. The hobbies section covers dancing, art and craft, content creation, open source contribution, public speaking, trekking, and traveling. The 12 case studies in `data/projects.js` and 10 additional GitHub projects in `data/more-projects.js` were adapted from her `Portfolio` repository, which also supplied selected project screenshots. The résumé download is in `resume/`.

`script.js` drives the scroll camera, the horizontal works gallery, project detail dialogs, and the character's cursor-following eyes. The résumé camera moves through cheek, sticker, eye, and low jaw close-ups before returning to the front. The character turns to show the back of her head before the gallery, then continues turning as projects advance. It uses original illustrated views with animated iris layers, so the rotation is an illustrated approximation rather than the reference's rigged 3D geometry.

The version before the eye and camera changes is preserved in GitHub at the `baseline-smooth-character-2026-11-22` tag.
