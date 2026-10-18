(() => {
  const lightbox = document.createElement("div");
  lightbox.id = "lightbox";
  document.body.appendChild(lightbox);

  function close() {
    lightbox.classList.remove("active");
    lightbox.replaceChildren();
  }

  document.addEventListener("click", event => {
    if (!(event.target instanceof Element)) return;
    const image = event.target.closest(".article .content img");
    if (!image) return;
    event.preventDefault();
    const enlarged = document.createElement("img");
    enlarged.src = image.src;
    enlarged.alt = image.alt;
    enlarged.style.cursor = "not-allowed";
    lightbox.replaceChildren(enlarged);
    lightbox.classList.add("active");
    lightbox.style.cursor = "zoom-out";
  });

  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) close();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") close();
  });
  document.addEventListener("turbo:before-cache", close);
  document.addEventListener("turbo:before-render", close);
})();
