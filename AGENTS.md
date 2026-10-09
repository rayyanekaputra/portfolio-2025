# AGENTS.md

Personal portfolio for Rayyan Eka Putra, live at https://rayyanekaputra.com. It's one animated page built with Astro 5, Sass (indented `.sass` syntax), anime.js v4, and Locomotive Scroll v5. The owner wrote it by hand, so keep their style and structure. Don't do big rewrites unless they ask for one.

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
    Navbar.astro              desktop social links (prop `navs`) + mobile "more" button (inline SVG icon)
    home/Hero.astro           "/home/rayyanekaputra" heading (name is clickable .home-name), loading text, typed tagline
    home/Certification.astro  certs data object + list
    home/Jobs.astro           jobs data object + list
    home/Projects.astro       projects data object + list
    home/Clients.astro        clients data object + 3-column list (own full-width .clients-row below .bottom-row; title beside list like .bottom-row, stacked at ≤1440px)
    home/Polaroids.astro      8 absolutely positioned, draggable photo cards
    Grain.astro               fixed SVG-noise grain overlay (z-index 0, rendered right before <Polaroids />)
  scripts/typer.js            typing effect, the only script in use
  styles/
    global.sass               reset + base typography, theme tokens (@property + html.dark), .transparent / .display-none helpers
    _colors.sass              earthy: $bg-color #EEDA9E, $prim-color #16553A, $off-color #B8B8B8, $light-color #FBF4DE
                              dark: $dark-bg-color #17181B, $dark-prim-color #9C9A95 (dim text), $dark-strong-color #D6D4CE (bold),
                              $dark-light-color #EFEDE7 (hover), $dark-btn-top/-bottom/-outline (gray menu button)
    _fonts.sass               Inter Tight @font-face (files in public/fonts)
public/                       fonts, photos/frame01-08.png, icons/, favicons, ogimage.png
```

## How the page works

- **Content lives in the components as data.** Certifications, jobs, and projects are each a `{ "+ label / org (years).": "url" }` object. An empty string means the entry renders without a link. Labels are lowercase, start with `+ `, and end with `.`. Use the same format for new entries.
  - Clients use the same object, but each label has three parts separated by ` / `: `"+ client (2023) / middle / field."`. `Clients.astro` splits it into a 3-column grid (left, left-aligned middle with `/ … /` added around it, right-aligned). Each `<p>` uses `justify-self` (start/start/end) so it hugs its text instead of stretching to the grid cell. A link wraps only the text in each column (an inline `<a>` inside each `<p>`, the 2nd and 3rd with `tabindex="-1"`), so the empty space in the row isn't clickable.
- **The intro animation hides content until it reveals it.** Elements start with the class `transparent` (opacity 0). The `createTimeline` in `src/pages/index.astro` fades them in step by step: mobile overlay closes → `#loading-text` counts to "initializing 100%" → `.hero-desc` → cert title/items → experience title/items → project title/items → client title/items → polaroids. Each step's `onComplete` removes `transparent`.
  - Each fade uses `ease: "inOutExpo"`. The item lists (certs, jobs, projects, clients, polaroids) use `delay: stagger(100, staggerRhythm)`. `staggerRhythm` is defined once near the top of the script as a `cubicBezier` ease, so gaps between items go slow → very fast → fast → slow. It shapes the delays, not the motion, so it works like the inverse of a normal ease-in-out. Tune the rhythm there, not in each step.
  - Steps overlap: from cert title onward, each `.add(...)` gets `overlapPrev` (`"<-=" + sectionOverlap`, defined next to `staggerRhythm`) as its position, so it starts before the previous step's `inOutExpo` tail ends. Tune the gap with `sectionOverlap`. The hero-desc step must NOT overlap: `#loading-text` and `.hero-desc` share a flex row, and `#loading-text` only gets `display-none` in its fade-out `onComplete`, so overlapping squeezes the hero text to the wrong width.
  - Each new section needs the `transparent` class, a `querySelector` in `index.astro`, and its own `.add(...)` step. Otherwise it stays invisible or appears without the animation.
  - The timeline finds elements by these class names: `.cert-item`, `.certification-title`, `.job-item`, `.experience-title`, `.project-item`, `.project-title`, `.client-item`, `.client-title`, `.polaroid-card`, `.hero-desc`, `#loading-text`, `.mobile-menu-overlay`. Renaming one breaks the animation.
- **Polaroids** become draggable (`createDraggable`) after they fade in. The mobile "more" button (`button.navbar-mobile-btn`) toggles the `.mobile-menu-overlay` clip-path circle. It no longer resets the drag instances (that line is commented out in `handleMobileClick`).
  - The draggables have no `container` (it's commented out), so cards can be pushed off the side of the screen. `section.first` is `position: relative` + `overflow-x: clip` so off-screen cards are cut off instead of causing horizontal scroll; `html` also has `overflow-x: clip` in `global.sass` because mobile browsers ignore `overflow-x` set only on `body`. Use `clip`, not `hidden`, so cards can still hang off vertically.
- **Name click → polaroid pile**: `rayyanekaputra` in the hero heading is `span.home-name` (hover: `var(--light)` text + faint `var(--glow)` `text-shadow`, styled in `Hero.astro`; every `a` gets the same hover from `global.sass`). Clicking it runs `stackPolaroids` in `index.astro`: cards pile at the centroid of their home positions with an 8px downward cascade (`stackOffset`), then `movePileToTop` slides the pile into the gap between the header (`.splash`) and the navbar (`ul.navbar-ul`, or `button.navbar-mobile-btn` at 1440px and below), top-aligned with the header. Both moves use 900ms `inOutExpo` and `stagger(60, staggerRhythm)`. Cards are moved with the draggables' `setX`/`setY` (not CSS) so drag state stays in sync. It does nothing until the polaroids are draggable, and `isStacking` blocks clicks while it runs. Renaming `.home-name`, `.splash`, or `.navbar-ul` breaks it.
- **Dark mode switch**: colors are CSS custom properties (`--bg`, `--fg` (regular text), `--strong` (bold text), `--shadow` (polaroid shadow), `--light`, `--glow`, `--accent`, `--btn-top`, `--btn-bottom`, `--btn-outline`, `--overlay`) built in `global.sass` from the `$theme-light`/`$theme-dark` maps (Sass color vars in `_colors.sass`). Each is registered with `@property` as `<color>` so `html` can transition them (1.2s, roughly inOutExpo). The page starts earthy every visit (no reduced-motion special case, it's just a color fade); the "HAPUS LOADING" step's `onComplete` adds `html.dark`, which fades every color. Use `var(--…)` for new colors, not the Sass vars directly, or they won't switch. The typer color is `data-colors="var(--accent)"`. The "more" icon is an inline SVG with `fill="currentColor"` (not `public/icons/more_ic.svg`) so it follows the button text color. In dark mode the button's inset highlight is only `inset 0 1px 0` (a `:global(html.dark)` override in `Navbar.astro`), because the earthy version's 1px spread plus the outline drew a double line on top. Dark palette direction from the owner: dark gray background, broken/dim white (never pure white), bold text brighter than regular text.
- **Grain**: `Grain.astro` is a fixed, oversized `.grain` div with an inline SVG `feTurbulence` background and a `steps()` jitter animation (under `html.dark` it switches to `mix-blend-mode: overlay`, opacity 1 + `filter: contrast(1.2)`, because soft-light barely shows on dark gray; the `grain-dark-in` keyframes fade the earthy grain out during the 1.2s color fade, swap the blend mode at opacity 0, then fade the dark grain in afterwards) (off under `prefers-reduced-motion`). It's `z-index: 0` with `pointer-events: none` and sits in the DOM just before `<Polaroids />`, so it paints over the unpositioned text but under the polaroids (z 0–7, later in the DOM) and the mobile overlay/navbar button (99999). Keep that DOM order.
- **Smooth scroll**: Locomotive Scroll v5 (built on Lenis, native scroll) is created at the top of the `index.astro` script as `locoScroll` with `autoStart: true`, so the page can be scrolled during the intro. The polaroid step's `onComplete` still calls `locoScroll.start()` (harmless), and `openMobileMenuAnim` calls `stop()`/`start()` so the page can't scroll behind the open menu. Its CSS is imported in `Layout.astro`. Lenis only re-measures page height when an element's size changes, not on transforms, so `refreshScrollHeight()` (`lenisInstance.resize()`, debounced by `refreshDelay`) runs in the draggables' `onSettle` and after the name-click pile. Don't give `body` its own `overflow` (it's commented out in `global.sass`): because `html` has `overflow-x: clip`, that turns `body` into a separate scroll container, and the wheel stops working because Lenis scrolls the window. Don't put `data-scroll-speed` on `.polaroid-card`: its transform would fight the draggable's `x`/`y`.
- **Typer**: `typer.js` runs on load. It finds `.typer` elements (configured with `data-words`, `data-delay`, `data-colors`, and `data-delete-delay`) and `.cursor[data-owner]` elements. `index.astro` loads it with a plain `<script src>`.
- **Responsive**: the only breakpoint is `1440px`. At 1440px and below, the desktop navbar is hidden, the mobile button appears, fonts get smaller, and the polaroids stack in the center.
- Astro scopes `<style>` to the file it's in. Styles in `index.astro` don't reach markup rendered inside a child component, so put those styles in the component (as `Clients.astro`, `Hero.astro`, and `Polaroids.astro` do).
- `global.sass` sets every `div` to `display: flex`. Keep that in mind when building layouts.

## Gotchas

- Open issue: throwing a polaroid back up while scrolled down shrinks the page at once, and the browser jumps the view before the debounced `refreshScrollHeight` runs. Possible fix: only let the scroll height grow, and shrink it on reset (name-click pile).
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
