# About Chinmayee

A visual portfolio inspired by the scroll-led composition of [About Sen](https://about.senbuzy.com/). Its source code is MIT licensed; the original character and other personal assets are excluded by the creator's [NOTICE](https://github.com/dayinji/sen-3d-resume/blob/main/NOTICE). This project uses new artwork based on Chinmayee's supplied photo, her résumé, and her own portfolio and GitHub repositories.

## Run locally

```sh
python3 -m http.server 5173
```

Open `http://localhost:5173`.

## Content and motion

`index.html` contains Chinmayee's biography, education, experience, skills, hobbies, and contact links. The hobbies section covers dancing, art and craft, content creation, open source contribution, public speaking, trekking, and traveling. The 12 case studies in `data/projects.js` and 10 additional GitHub projects in `data/more-projects.js` were adapted from her `Portfolio` repository, which also supplied selected project screenshots. The résumé download is in `resume/`.

`script.js` drives the scroll camera, the horizontal works gallery, and project detail dialogs. The character consists of matching front, side, and rear raster views. It approximates the reference's camera movement; it is not a rigged 3D model and cannot reproduce its live eye tracking or exact geometry.
