# AGENTS.md

Personal portfolio for Rayyan Eka Putra, live at https://rayyanekaputra.com. It's one animated page built with Astro 5, Sass (indented `.sass` syntax), and anime.js v4. The owner wrote it by hand, so keep their style and structure. Don't do big rewrites unless they ask for one.

## Commands

```sh
bun install
bun run dev      # dev server at localhost:4321
bun run build    # static build to ./dist
bun run preview  # serve the build
```

Use bun, not npm. `bun.lock` is the lockfile that counts, and `package-lock.json` is an old leftover. There are no tests, linter, or formatter. To check a change, run `bun run build` and look at the page in the dev server.

## Layout

```
src/
  layouts/Layout.astro        <html> shell: OG/Twitter meta, favicons, imports global.sass
  pages/index.astro           the only page; composes components + the anime.js intro timeline
  components/
    Navbar.astro              desktop social links (prop `navs`) + mobile "more" button
    home/Hero.astro           "/home/rayyanekaputra" heading (name is clickable .home-name), loading text, typed tagline
    home/Certification.astro  certs data object + list
    home/Jobs.astro           jobs data object + list
    home/Projects.astro       projects data object + list
    home/Clients.astro        clients data object + 3-column list (own full-width .clients-row below .bottom-row)
    home/Polaroids.astro      8 absolutely positioned, draggable photo cards
  scripts/typer.js            typing effect, the only script in use
  styles/
    global.sass               reset + base typography, .transparent / .display-none helpers
    _colors.sass              $bg-color #EEDA9E, $prim-color #16553A, $off-color #B8B8B8, $light-color #FBF4DE
    _fonts.sass               Inter Tight @font-face (files in public/fonts)
public/                       fonts, photos/frame01-08.png, icons/, favicons, ogimage.png
```

## How the page works

- **Content lives in the components as data.** Certifications, jobs, and projects are each a `{ "+ label / org (years).": "url" }` object. An empty string means the entry renders without a link. Labels are lowercase, start with `+ `, and end with `.`. Use the same format for new entries.
  - Clients use the same object, but each label has three parts separated by ` / `: `"+ client (2023) / middle / field."`. `Clients.astro` splits it into a 3-column grid (left, center with `/ … /` added around it, right-aligned). A link makes the whole line clickable.
- **The intro animation hides content until it reveals it.** Elements start with the class `transparent` (opacity 0). The `createTimeline` in `src/pages/index.astro` fades them in step by step: mobile overlay closes → `#loading-text` counts to "initializing 100%" → `.hero-desc` → cert title/items → experience title/items → project title/items → client title/items → polaroids. Each step's `onComplete` removes `transparent`.
  - Each fade uses `ease: "inOutExpo"`. The item lists (certs, jobs, projects, clients, polaroids) use `delay: stagger(100, staggerRhythm)`. `staggerRhythm` is defined once near the top of the script as a `cubicBezier` ease, so gaps between items go slow → very fast → fast → slow. It shapes the delays, not the motion, so it works like the inverse of a normal ease-in-out. Tune the rhythm there, not in each step.
  - Steps overlap: from cert title onward, each `.add(...)` gets `overlapPrev` (`"<-=" + sectionOverlap`, defined next to `staggerRhythm`) as its position, so it starts before the previous step's `inOutExpo` tail ends. Tune the gap with `sectionOverlap`. The hero-desc step must NOT overlap: `#loading-text` and `.hero-desc` share a flex row, and `#loading-text` only gets `display-none` in its fade-out `onComplete`, so overlapping squeezes the hero text to the wrong width.
  - Each new section needs the `transparent` class, a `querySelector` in `index.astro`, and its own `.add(...)` step. Otherwise it stays invisible or appears without the animation.
  - The timeline finds elements by these class names: `.cert-item`, `.certification-title`, `.job-item`, `.experience-title`, `.project-item`, `.project-title`, `.client-item`, `.client-title`, `.polaroid-card`, `.hero-desc`, `#loading-text`, `.mobile-menu-overlay`. Renaming one breaks the animation.
- **Polaroids** become draggable (`createDraggable`) after they fade in. The mobile "more" button (`button.navbar-mobile-btn`) resets every drag instance and toggles the `.mobile-menu-overlay` clip-path circle.
- **Name click → polaroid pile**: `rayyanekaputra` in the hero heading is `span.home-name` (hover: `$light-color` text + faint green `text-shadow`, styled in `Hero.astro`). Clicking it runs `stackPolaroids` in `index.astro`: cards pile at the centroid of their home positions with an 8px downward cascade (`stackOffset`), then `movePileToTop` slides the pile into the gap between the header (`.splash`) and the navbar (`ul.navbar-ul`, or `button.navbar-mobile-btn` at 1440px and below), top-aligned with the header. Both moves use 900ms `inOutExpo` and `stagger(60, staggerRhythm)`. Cards are moved with the draggables' `setX`/`setY` (not CSS) so drag state stays in sync. It does nothing until the polaroids are draggable, and `isStacking` blocks clicks while it runs. Renaming `.home-name`, `.splash`, or `.navbar-ul` breaks it.
- **Typer**: `typer.js` runs on load. It finds `.typer` elements (configured with `data-words`, `data-delay`, `data-colors`, and `data-delete-delay`) and `.cursor[data-owner]` elements. `index.astro` loads it with a plain `<script src>`.
- **Responsive**: the only breakpoint is `1440px`. At 1440px and below, the desktop navbar is hidden, the mobile button appears, fonts get smaller, and the polaroids stack in the center.
- Astro scopes `<style>` to the file it's in. Styles in `index.astro` don't reach markup rendered inside a child component, so put those styles in the component (as `Clients.astro`, `Hero.astro`, and `Polaroids.astro` do).
- `global.sass` sets every `div` to `display: flex`. Keep that in mind when building layouts.

## Gotchas

- `src/scripts/centralAnimationTimeline.js`, `typewriter.js`, and `typewriter2.js` are unused leftovers. `centralAnimationTimeline.js` uses the anime.js v3 API, which this project no longer uses.
- `_colors.sass` previously had no trailing newline; appending with `echo >>` glued lines together. Check the file ends with a newline.
- `Hero.astro` has a stray closing `</script>` at the end.
- Fonts: `@font-face` uses a plain `url()` with no `format('truetype')`. An earlier bug came from that format hint.
- The `<script>` in `index.astro` has `//@ts-nocheck`, and some of its comments are in Indonesian or Makassarese. Keep them.
- `README.md` is still the default Astro starter text.
- Social links appear twice in `index.astro`: once in the mobile overlay and once in the `Navbar` `navs` prop. Update both.
- Edit the meta description and OG text in `Layout.astro`.

## Workflow

The owner works on a `dev` branch and merges to `main` through PRs. Commit messages use conventional prefixes (`feat:`, `fix:`).

The owner does all git operations themselves: commits, pushes, branches, merges, and PRs. Agents must not run git commands that change the repo or remote. Leave changes uncommitted and, when done, suggest a commit message instead. Read-only commands like `git status`, `git diff`, and `git log` are fine.
