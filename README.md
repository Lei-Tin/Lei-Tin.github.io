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
tags: ["Daily life", "Little things"]
---

Your entry goes here.

![A photo from the weekend](/assets/images/weekend.jpg)
```

Add your own image file at the path used in the Markdown. Reuse an existing tag or add a new one; the homepage generates its tag filters, counts, and collapsible year groups from the posts automatically. Dates control the newest/oldest sorting. Future-dated entries appear once their date is reached and the site is rebuilt.

Preview locally with `bundle exec jekyll serve`.

## Motion

Year groups slide open or closed in 320 ms. Tag filtering fades departing entries out for 110 ms, then moves the remaining entries into place; sorting uses a 300 ms position transition. Incoming entries fade in with a short stagger, and cards lift by 3 px on hover. These effects use native browser animations, so new Markdown entries receive them automatically with no extra configuration.

The site respects the system's “Reduce motion” preference: browsing changes become immediate, hover movement is disabled, and the decorative rain is hidden. Animation changes can be interrupted by the next click without locking the controls.
