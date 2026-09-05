# Blog writing preferences

Apply these preferences when drafting or editing blog content in this repository. The user's latest wording and explicit instructions take precedence. Preserve user edits unless asked to revise them.

## Voice and scope

- This is a personal blog for casual life updates, games, furry interests, art, and small projects. It is separate from the professional site at shouyihung.com.
- Write as a person recording something they wanted to share. Avoid portfolio copy, promotional hooks, clickbait titles, generic reflections, and polished essay conclusions.
- Let the content determine length. A complete entry can be one sentence or a picture with a short caption. Do not expand a short thought just to make it feel like a blog post.
- Prefer concrete personal context over invented reactions. A first experience with Azure or an OC that existed long before its first commission is useful when supplied by the user. Do not invent anecdotes, motives, feelings, or habits to fill space.
- Small technical details are welcome when they are part of the personal experience. Do not turn project entries into feature lists or remove all technical context simply to sound casual.
- Use plain, descriptive titles: a game name, a Discord music bot, a mod for a named game, or the small event itself.
- Chinese and English are both welcome; natural mixing such as “oc”, “furry”, and “Azure” fits. Casual endings such as `w`, `:3`, `haha`, or an emoticon can appear sparingly when appropriate. Do not force them into every paragraph or deliberately reproduce spelling mistakes.
- Use Chinese double quotation marks “”, not corner brackets 「」.
- X is a source of relevant ideas and the user's voice, not a feed to mirror. Select occasional entries across months. Do not put X post links or “expanded from a tweet” framing in article bodies. Keep artist credit as a name/handle when appropriate. This does not remove the homepage's X social icon.
- When the user asks to backfill dated entries, do not add retrospective/backfill disclaimers. Base dates on available evidence; do not invent past events to fill empty months.
- Before drafting a batch of new entries, give the user a short topic list, then proceed unless they ask to review first.

## Author-edited examples

The user directly revised these entries in commit `8bd0c5d`. Use their current versions as stronger voice references than assistant-written entries elsewhere in the archive:

- `all_collections/_posts/2026-08-28-big-walk.md`: reduced to “Big Walk 10/10，有朋友的话真的可以一起玩 🥹”. The recommendation already says enough; extra commentary was unnecessary.
- `all_collections/_posts/2026-09-04-first-furry-commission.md`: replaced descriptive/emotional filler with the concrete context that the OC had existed for a long time before this first commission. Kept a short, casual paragraph, the image, and the artist credit “奶糊饼w，@Naihubing”. Do not extrapolate unmentioned commission details.
- `all_collections/_posts/2023-07-01-rei-bot.md`: added that this was the user's first exposure to Microsoft Azure and cloud hosting. Rei uses **he/him**, not she/her.

These are a small set of direct edits, not evidence that every untouched draft is the user's preferred wording. Update these notes when later user edits establish a clearer preference.

## Content format

- Continue writing Markdown in `all_collections/_posts/YYYY-MM-DD-slug.md` with `layout: post`.
- Include `English` or `中文` in `tags`, based on the main language. Add both only for substantially bilingual content; an English name in a Chinese paragraph does not make it bilingual.
- Reuse topic tags when appropriate. Language tags and topic tags automatically drive homepage filtering.
- Use optimized local images with meaningful alt text and retain artist attribution. See README.md for image paths and Kramdown image attributes.
- Do not rewrite existing articles merely to apply these notes. Commit and push only when requested or otherwise authorized for that specific update.
