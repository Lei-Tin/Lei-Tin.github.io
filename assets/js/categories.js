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
  let opener = null;

  function close(restoreFocus = true) {
    document.getElementById("category-modal-bg")?.classList.remove("open");
    document.getElementById("category-modal")?.classList.remove("open");
    if (restoreFocus && opener?.isConnected) opener.focus();
    opener = null;
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
    background.classList.add("open");
    modal.classList.add("open");
    content.querySelector("a")?.focus();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") close();
  });
  document.addEventListener("turbo:before-cache", () => close(false));
  document.addEventListener("turbo:before-render", () => close(false));
})();
