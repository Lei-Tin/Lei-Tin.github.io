---
---

(() => {
  const tags = {
    {% for tag in site.tags %}
    {{ tag[0] | jsonify }}: [
      {% for post in tag[1] %}
      { url: {{ site.baseurl | append: post.url | jsonify }}, date: {{ post.date | date_to_string | jsonify }}, title: {{ post.title | jsonify }} }{% unless forloop.last %},{% endunless %}
      {% endfor %}
    ]{% unless forloop.last %},{% endunless %}
    {% endfor %}
  };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const animations = new Set();
  const easing = "cubic-bezier(0.22, 1, 0.36, 1)";
  let opener = null;
  let revision = 0;
  let closing = false;

  function cancelAnimations() {
    animations.forEach(animation => animation.cancel());
    animations.clear();
  }

  function animate(element, frames, duration, delay = 0) {
    const animation = element.animate(frames, { duration, delay, easing, fill: "both" });
    animations.add(animation);
    return animation.finished.then(() => {
      animations.delete(animation);
      animation.cancel();
    }, () => animations.delete(animation));
  }

  function appearance(element) {
    const style = getComputedStyle(element);
    return { opacity: style.opacity, transform: style.transform };
  }

  async function close({ restoreFocus = true, immediate = false } = {}) {
    const current = ++revision;
    const background = document.getElementById("category-modal-bg");
    const modal = document.getElementById("category-modal");
    const wasOpen = modal?.classList.contains("open");
    const fromModal = wasOpen ? appearance(modal) : null;
    const fromBackground = wasOpen ? appearance(background) : null;
    cancelAnimations();
    if (restoreFocus && opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
    if (!modal || !background) return;
    modal.inert = true;
    modal.setAttribute("aria-hidden", "true");
    closing = true;
    if (wasOpen && !immediate && !reducedMotion.matches && typeof modal.animate === "function") {
      await Promise.all([
        animate(background, [fromBackground, { opacity: 0 }], 180),
        animate(modal, [fromModal, { opacity: 0, transform: "translateY(8px) scale(0.985)" }], 180)
      ]);
    }
    if (current !== revision) return;
    background.classList.remove("open");
    modal.classList.remove("open");
    closing = false;
  }

  document.addEventListener("click", event => {
    if (!(event.target instanceof Element)) return;
    if (event.target.id === "category-modal-bg") return close();
    const link = event.target.closest(".category[data-tag]");
    if (!link) return;
    const background = document.getElementById("category-modal-bg");
    const modal = document.getElementById("category-modal");
    const title = document.getElementById("category-modal-title");
    const content = document.getElementById("category-modal-content");
    if (!background || !modal || !title || !content) return;
    event.preventDefault();
    revision++;
    const wasOpen = modal.classList.contains("open");
    const fromModal = wasOpen ? appearance(modal) : { opacity: 0, transform: "translateY(12px) scale(0.985)" };
    const fromBackground = wasOpen ? appearance(background) : { opacity: 0 };
    cancelAnimations();
    closing = false;
    opener = link;
    title.textContent = link.dataset.tag;
    const posts = tags[link.dataset.tag] || [];
    const entries = document.createDocumentFragment();
    posts.forEach(post => {
      const article = document.createElement("a");
      article.className = "modal-article";
      article.href = post.url;
      const heading = document.createElement("h4");
      heading.textContent = post.title;
      const date = document.createElement("small");
      date.className = "modal-article-date";
      date.textContent = post.date;
      article.append(heading, date);
      entries.appendChild(article);
    });
    content.replaceChildren(entries);
    content.scrollTop = 0;
    background.classList.add("open");
    modal.classList.add("open");
    modal.inert = false;
    modal.setAttribute("aria-hidden", "false");
    if (!reducedMotion.matches && typeof modal.animate === "function") {
      animate(background, [fromBackground, { opacity: 1 }], 220);
      animate(modal, [fromModal, { opacity: 0.9, transform: "none" }], 260);
      // Animate only rows that can be seen; long tag lists need no extra layers.
      const visibleHeight = content.clientHeight;
      [...content.children].filter(row => row.offsetTop - content.offsetTop < visibleHeight).forEach((row, index) => {
        animate(row, [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], 180, Math.min(index * 18, 90));
      });
    }
    (content.querySelector("a") || modal).focus({ preventScroll: true });
  });

  document.addEventListener("keydown", event => {
    const modal = document.getElementById("category-modal");
    if (!modal?.classList.contains("open") || closing) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      const links = [...modal.querySelectorAll("a[href]")];
      const first = links[0] || modal;
      const last = links.at(-1) || modal;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  document.addEventListener("turbo:before-cache", () => close({ restoreFocus: false, immediate: true }));
  document.addEventListener("turbo:before-render", () => close({ restoreFocus: false, immediate: true }));
  reducedMotion.addEventListener("change", () => {
    if (closing) close({ immediate: true });
    else cancelAnimations();
  });
})();
