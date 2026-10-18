# Basic Information

This is a blog type webpage that I managed to create using Jekyll and GitHub Pages. 

Deployed at: [lei-tin.github.io](lei-tin.github.io)

Updates irregularly! 

Thanks for checking it out! 💖

## Writing a new entry

Create `all_collections/_posts/YYYY-MM-DD-your-title.md` and write the entry in Markdown:

```markdown
---
layout: post
title: A little weekend update
date: 2026-09-05
tags: ["Daily life", "Little things", "English"]
---

Your entry goes here.

![A photo from the weekend](/assets/images/weekend.jpg)
```

Add your own image file at the path used in the Markdown. Reuse an existing tag or add a new one; the homepage generates its tag filters, counts, and collapsible year groups from the posts automatically. Dates control the newest/oldest sorting. Future-dated entries appear once their date is reached and the site is rebuilt.

Use `English` for entries written in English and `中文` for entries written in Chinese. For a substantially bilingual entry, add both. Language tags work with the same homepage filters as topic tags.

Preview locally with `bundle exec jekyll serve`.

## Entry images

Store web-sized copies in `assets/images/entries/`. Keep original photos and commission master files in your own backup, outside Git. The current entry images use WebP, with embedded metadata removed; keep artwork uncropped and credit the artist in the entry.

For Markdown images, optional Kramdown attributes preserve the image's aspect ratio and defer off-screen downloads:

```markdown
![Describe the image]({{ "/assets/images/entries/example.webp" | relative_url }}){: loading="lazy" decoding="async" width="1200" height="900"}
```

At the current size, storing these optimized copies alongside posts is simple and portable. If the collection grows substantially, Cloudflare R2 with a custom image domain is a suitable alternative: upload the images there and use their HTTPS URLs in the same Markdown. R2 has storage and request quotas, so check current pricing before enabling it. Its `r2.dev` URL is intended for development rather than production. No external image service is configured yet.

## Motion

Internal links use locally bundled Turbo Drive 8.0.23 for navigation without a full document reload. Page-specific stylesheets are swapped with the destination page, and only `<main>` is replaced so the rain canvas keeps running. The renderer lets Turbo capture the outgoing page before replacing its content, then clones cached content before insertion so repeated history visits cannot consume a cached page. Browser history and direct article URLs continue to work. Writing and publishing still use Jekyll and Markdown.

The selected archive card morphs into its article header over 420 ms using the Web Animations API. One temporary card animates its position, size, title typography, date, and tags together; the destination card is revealed when the animation finishes. Article content unfolds alongside it and folds back up on return. Other visible page components fade in over 260 ms with the same easing and short stagger as incoming entries during tag filtering. The fade begins alongside the morph, with the first frame staged before revealing the new page so components cannot flash at full opacity. The outgoing body retains its existing DOM and images in an isolated, viewport-sized layer until it finishes folding, then the layer is removed. The rain stays live. Reduced-motion preferences disable the animation, and scrolling or resizing cancels it immediately.

Turbo's cached previews are disabled to avoid rendering the same navigation twice; browser Back and Forward still use the history cache. When the article was opened directly from the archive, its back arrow uses browser history to return to the clicked card's saved scroll position. Direct article visits retain a normal homepage link.

Blog controls initialize after navigation and dispose their listeners before leaving. The current tag, sort order, and folded years are remembered in the tab during navigation. Tag lists and image previews use delegated listeners, so they also work on newly loaded articles. The vendored script and its MIT license are in `assets/js/vendor/`.

Article tag dialogs fade and slide into place over 260 ms, with a short stagger on visible list entries. The backdrop fades alongside them, and closing takes 180 ms. Escape or clicking the backdrop closes the dialog and returns focus to its tag. Animations can be interrupted, respect reduced motion, and are cleared immediately before a page is cached or replaced.

Year groups slide open or closed in 320 ms. Tag filtering fades departing entries out for 110 ms, then moves the remaining entries into place; sorting uses a 300 ms position transition. Incoming entries fade in with a short stagger, and cards lift by 3 px on hover. These effects use native browser animations, so new Markdown entries receive them automatically with no extra configuration.

The site respects the system's “Reduce motion” preference: browsing changes become immediate, hover movement is disabled, and the decorative rain is hidden. Animation changes can be interrupted by the next click without locking the controls.

Rain follows a smooth daily curve in the visitor's local time, peaking at 02:00. With decimal local hour `h`, intensity is `((1 + cos((h - 2) * PI / 12)) / 2)^3`. Cubing the raised cosine concentrates rain around 23:00–05:00 and keeps most of the day quiet. Desktop uses `round(30 + 120 * intensity)` drops; mobile uses half that count, rounded to the nearest whole drop. This gives 105 desktop / 53 mobile drops at 23:00 and 05:00, 150 / 75 at 02:00, and a minimum of 30 / 15 at 14:00.

Rain is drawn into one canvas rather than individual animated DOM elements. Each drop's gradient and blur are rendered into a small reusable sprite when the viewport or intensity changes; frames only move those sprites. There are no per-drop DOM listeners, layout changes, or live blur filters. Drawing pauses when the tab is hidden and redraws at up to 60 fps. Canvas resolution is capped at 1.5× on desktop and 1.25× on mobile to limit work on high-density screens without reducing the number of drops.

The page checks time once a minute and only adds or removes the difference. At night, drops become longer (up to 14 vh desktop / 8 vh mobile) and faster (0.8–2.5 seconds at the peak); quiet-time falls take 3.5–6.5 seconds. All lengths and durations stay positive. Speed changes preserve each drop's fall progress. Mobile means a coarse primary pointer without hover support; narrow desktop windows retain desktop rain. Viewport, input-device, and motion-preference changes take effect without a reload.
