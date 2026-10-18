(() => {
  const container = document.getElementById("rain-container");
  if (!container) return;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return;
  canvas.setAttribute("aria-hidden", "true");
  container.appendChild(canvas);

  // Input capabilities distinguish phones from narrow desktop windows.
  const mobile = window.matchMedia("(hover: none) and (pointer: coarse)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const drops = [];
  let width = 0;
  let height = 0;
  let scale = 1;
  let intensity = 0;
  let frame = null;
  let previousTime = null;

  function mix(low, high, amount) {
    return low + (high - low) * amount;
  }

  function rainIntensity(hours) {
    const cosine = (1 + Math.cos((hours - 2) * Math.PI / 12)) / 2;
    return Math.pow(Math.max(0, Math.min(1, cosine)), 3);
  }

  function prepareDrop(drop) {
    const isMobile = mobile.matches;
    drop.duration = mix(mix(3.5, 0.8, intensity), mix(6.5, 2.5, intensity), drop.speed);
    drop.height = height * mix(isMobile ? 1.5 : 2,
      isMobile ? mix(4, 8, intensity) : mix(5, 14, intensity), drop.length) / 100;
    const dropWidth = height * mix(0.1, isMobile ? 0.3 : 0.8, drop.width) / 100;
    const padding = Math.ceil(drop.blur * 3 + 2);
    const sprite = document.createElement("canvas");
    sprite.width = Math.ceil((dropWidth + padding * 2) * scale);
    sprite.height = Math.ceil((drop.height + padding * 2) * scale);
    const paint = sprite.getContext("2d");
    paint.scale(scale, scale);
    const gradient = paint.createLinearGradient(0, padding, 0, padding + drop.height);
    gradient.addColorStop(0, "#3f3f3f");
    gradient.addColorStop(1, "#eeeeee");
    paint.fillStyle = gradient;
    paint.filter = `blur(${drop.blur}px)`;
    paint.beginPath();
    paint.roundRect(padding, padding, dropWidth, drop.height, dropWidth / 2);
    paint.fill();
    drop.sprite = sprite;
    drop.padding = padding;
  }

  function draw(time) {
    frame = null;
    // High-refresh screens do not need more than 60 decorative redraws per second.
    if (previousTime !== null && time - previousTime < 1000 / 60 - 0.5) {
      frame = requestAnimationFrame(draw);
      return;
    }
    const elapsed = previousTime === null ? 0 : Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;
    context.clearRect(0, 0, width, height);
    for (const drop of drops) {
      drop.age += elapsed;
      drop.progress += elapsed / drop.duration;
      if (drop.progress >= 1) {
        drop.progress %= 1;
        drop.x = Math.random();
      }
      context.globalAlpha = 0.4 * Math.min(1, drop.age / 2);
      context.drawImage(drop.sprite, drop.x * width - drop.padding,
        -drop.height + drop.progress * height * 1.15 - drop.padding,
        drop.sprite.width / scale, drop.sprite.height / scale);
    }
    frame = requestAnimationFrame(draw);
  }

  function updatePlayback() {
    const shouldRun = !document.hidden && !reducedMotion.matches && width > 0 && height > 0;
    if (shouldRun && frame === null) {
      previousTime = null;
      frame = requestAnimationFrame(draw);
    } else if (!shouldRun) {
      cancelAnimationFrame(frame);
      frame = null;
      previousTime = null;
      context.clearRect(0, 0, width, height);
    }
  }

  function updateRain() {
    const now = new Date();
    intensity = rainIntensity(now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600);
    const desktopCount = Math.round(30 + 120 * intensity);
    const count = reducedMotion.matches ? 0 : mobile.matches ? Math.round(desktopCount / 2) : desktopCount;
    drops.length = Math.min(drops.length, count);
    while (drops.length < count) {
      drops.push({ x: Math.random(), progress: Math.random(), speed: Math.random(),
        length: Math.random(), width: Math.random(), blur: Math.random() * 3, age: 0 });
    }
    drops.forEach(prepareDrop);
    updatePlayback();
  }

  function resize() {
    width = container.clientWidth;
    height = container.clientHeight;
    // Limit backing-store size on high-density screens without changing rain count.
    scale = Math.min(window.devicePixelRatio || 1, mobile.matches ? 1.25 : 1.5);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    updateRain();
  }

  new ResizeObserver(resize).observe(container);
  window.setInterval(updateRain, 60 * 1000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) updateRain();
    updatePlayback();
  });
  mobile.addEventListener("change", resize);
  reducedMotion.addEventListener("change", updateRain);
})();
