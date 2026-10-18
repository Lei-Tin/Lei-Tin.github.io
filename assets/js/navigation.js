(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const duration = 420;
  const easing = "cubic-bezier(0.4, 0, 0.2, 1)";
  const partSelectors = [".article-title", ".date", ".categories"];
  const textProperties = ["fontFamily", "fontSize", "fontWeight", "fontStyle", "lineHeight", "letterSpacing", "color"];
  let routeIndex = 0;
  let routes = [location.href];
  let source = null;
  let motion = null;
  let outgoingContent = null;
  let articleStyles = null;

  function capture(element, parent) {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      text: element.textContent.trim(),
      box: { left: `${rect.left - parent.left}px`, top: `${rect.top - parent.top}px`, width: `${rect.width}px` },
      textStyle: Object.fromEntries(textProperties.map(key => [key, style[key]]))
    };
  }

  function captureCard(card) {
    const rect = card.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= innerHeight) return null;
    const style = getComputedStyle(card);
    const parts = partSelectors.map(selector => capture(card.querySelector(selector), rect));
    const tags = [...card.querySelector(".categories").children].map(tag => {
      const style = getComputedStyle(tag);
      return { text: tag.textContent, style: Object.fromEntries([
        ...textProperties, "backgroundColor", "borderRadius", "padding", "margin"
      ].map(key => [key, style[key]])) };
    });
    return { url: card.dataset.postUrl, parts, tags,
      box: { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`,
        borderRadius: style.borderRadius, backgroundColor: style.backgroundColor, opacity: style.opacity } };
  }

  function captureOutgoingContent() {
    const content = document.querySelector(".article > .content");
    if (!content) return null;
    const rect = content.getBoundingClientRect();
    const top = Math.max(0, rect.top);
    const height = Math.min(innerHeight, rect.bottom) - top;
    if (height <= 0) return null;
    // Retain the existing content and image elements; isolate their outgoing styles.
    articleStyles ??= [...document.styleSheets]
      .filter(sheet => /\/assets\/css\/(post|syntax)\.css(?:\?|$)/.test(sheet.href || ""))
      .flatMap(sheet => [...sheet.cssRules].filter(rule => rule.type !== CSSRule.IMPORT_RULE).map(rule => rule.cssText))
      .join("\n");
    const style = getComputedStyle(content);
    return { element: content, top: rect.top - top, width: rect.width,
      textStyle: Object.fromEntries(textProperties.map(key => [key, style[key]])),
      box: { left: `${rect.left}px`, top: `${top}px`, width: `${rect.width}px`, height: `${height}px` } };
  }

  function prepareOutgoingContent(snapshot) {
    if (!snapshot) return null;
    const host = document.createElement("div");
    host.className = "route-content-morph";
    host.setAttribute("aria-hidden", "true");
    Object.assign(host.style, snapshot.box, snapshot.textStyle);
    const shadow = host.attachShadow({ mode: "open" });
    const styles = document.createElement("style");
    styles.textContent = articleStyles;
    Object.assign(snapshot.element.style, {
      position: "absolute", left: "0", top: `${snapshot.top}px`, width: `${snapshot.width}px`,
      boxSizing: "border-box", maxWidth: "none", margin: "0"
    });
    shadow.append(styles, snapshot.element);
    document.body.appendChild(host);
    return host;
  }

  function finishMotion() {
    outgoingContent = null;
    if (!motion) return;
    const previous = motion;
    motion = null;
    previous.target.classList.remove("route-morph-target");
    if (previous.content) previous.content.style.clipPath = previous.contentClip;
    previous.shell.remove();
    previous.exitContent?.remove();
    previous.animations.forEach(animation => animation.cancel());
  }

  function prepareMotion(target) {
    const shell = document.createElement("div");
    shell.className = "route-card-morph";
    shell.setAttribute("aria-hidden", "true");
    Object.assign(shell.style, source.box);
    const parts = source.parts.map((part, index) => {
      const element = document.createElement("div");
      element.className = "route-card-part";
      Object.assign(element.style, part.box, part.textStyle);
      if (index === 2) {
        element.classList.add("route-card-tags");
        source.tags.forEach(tag => {
          const label = document.createElement("span");
          label.textContent = tag.text;
          Object.assign(label.style, tag.style);
          element.appendChild(label);
        });
      } else element.textContent = part.text;
      shell.appendChild(element);
      return element;
    });
    target.classList.add("route-morph-target");
    const content = document.querySelector(".article > .content");
    const contentClip = content?.style.clipPath || "";
    if (content) content.style.clipPath = "inset(0 0 100% 0 round 15px)";
    document.body.appendChild(shell);
    const exitContent = prepareOutgoingContent(outgoingContent);
    motion = { shell, parts, target, content, contentClip, exitContent, animations: [] };
  }

  document.addEventListener("turbo:before-visit", event => {
    // The archive arrow restores the clicked card, including its scroll position.
    if (document.querySelector(".article-header") && routeIndex > 0 && routes[routeIndex - 1] === event.detail.url) {
      if (document.querySelector(".site-title")?.href === event.detail.url) {
        event.preventDefault();
        history.back();
      }
    }
  });

  document.addEventListener("turbo:visit", event => {
    finishMotion();
    source = null;
    const { url, action } = event.detail;
    if (action === "restore") {
      const direction = document.documentElement.dataset.turboVisitDirection === "back" ? -1 : 1;
      if (routes[routeIndex + direction] === url) routeIndex += direction;
      else { routes = [url]; routeIndex = 0; }
    } else if (action === "replace") routes[routeIndex] = url;
    else {
      routes = routes.slice(0, ++routeIndex);
      routes.push(url);
    }
    if (reducedMotion.matches) return;
    const cards = [...document.querySelectorAll("[data-post-url]")];
    const card = document.querySelector(".article-header") || cards.find(card => card.dataset.postUrl === new URL(url).pathname);
    if (card) {
      source = captureCard(card);
      const archive = document.querySelector(".site-title");
      if (source && document.querySelector(".article-header") && new URL(url).pathname === new URL(archive.href).pathname) {
        outgoingContent = captureOutgoingContent();
      }
    }
  });

  document.addEventListener("turbo:before-render", event => {
    const render = event.detail.render;
    event.detail.render = (currentBody, nextBody) => {
      const currentMain = currentBody.querySelector("main");
      const nextMain = nextBody.querySelector("main");
      if (!currentMain || !nextMain) return render(currentBody, nextBody);
      // Clone cached content and keep the rain canvas connected throughout visits.
      const replacement = nextMain.cloneNode(true);
      replacement.querySelectorAll(".route-morph-target").forEach(element => element.classList.remove("route-morph-target"));
      currentMain.replaceWith(replacement);
      const target = [...replacement.querySelectorAll("[data-post-url]")].find(card => card.dataset.postUrl === source?.url);
      if (target && !reducedMotion.matches) prepareMotion(target);
    };
  });

  document.addEventListener("turbo:load", () => {
    // Turbo has now applied the destination styles and restored its scroll position.
    if (!motion) { source = null; outgoingContent = null; return; }
    if (reducedMotion.matches) { finishMotion(); source = null; return; }
    const current = motion;
    const destination = captureCard(current.target);
    if (!destination) { finishMotion(); source = null; return; }
    const animate = (element, from, to) => current.animations.push(element.animate([from, to], { duration, easing, fill: "both" }));
    animate(current.shell, source.box, destination.box);
    current.parts.forEach((part, index) => animate(part,
      { ...source.parts[index].box, ...source.parts[index].textStyle },
      { ...destination.parts[index].box, ...destination.parts[index].textStyle }));
    if (current.content) animate(current.content, { clipPath: "inset(0 0 100% 0 round 15px)" }, { clipPath: "inset(0 0 0 0 round 15px)" });
    if (current.exitContent) {
      const bottom = box => parseFloat(box.top) + parseFloat(box.height);
      animate(current.exitContent,
        { clipPath: "inset(0 0 0 0 round 15px)", transform: "translateY(0)" },
        { clipPath: "inset(0 0 100% 0 round 15px)", transform: `translateY(${bottom(destination.box) - bottom(source.box)}px)` });
    }
    source = null;
    outgoingContent = null;
    Promise.allSettled(current.animations.map(animation => animation.finished)).then(() => {
      if (motion === current) finishMotion();
    });
  });

  reducedMotion.addEventListener("change", () => { finishMotion(); source = null; });
  window.addEventListener("resize", () => { finishMotion(); source = null; }, { passive: true });
  document.addEventListener("wheel", finishMotion, { passive: true });
  document.addEventListener("touchmove", finishMotion, { passive: true });
})();
