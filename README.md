# portfolio-rayyan

My personal site, live at [rayyanekaputra.com](https://rayyanekaputra.com).

It's a single page that types itself in, fades everything in bit by bit, then quietly switches to dark mode once it's done loading. There are polaroids you can drag around and throw off the screen. Click my name in the header and they all pile back up.

## What it's made of

- [Astro 5](https://astro.build) for the page itself
- Sass (the indented `.sass` kind) for styles
- [anime.js v4](https://animejs.com) for the intro timeline and the draggable polaroids
- [Locomotive Scroll v5](https://scroll.locomotive.ca) for smooth scrolling
- Inter Tight for the type

## Running it

I use bun, so:

```sh
bun install
bun run dev      # localhost:4321
bun run build    # builds to ./dist
bun run preview  # serves the build
```

## Where things are

- `src/pages/index.astro` is the page and the whole intro animation
- `src/components/home/` has the sections (certs, jobs, projects, clients, polaroids). The content is just objects at the top of each file, so updating stuff means editing those
- `src/styles/` has the colors, fonts, and global styles
- `public/` has the photos, fonts, and icons

## License

The code's here for you to look at and poke around in. The photos and personal content are mine though, so please don't reuse those.
