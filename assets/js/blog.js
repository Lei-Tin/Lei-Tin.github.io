(() => {
  let dispose = () => {};
  let savedState = null;

  function initializeBlog() {
    dispose();
    dispose = () => {};
    const controls = document.querySelector('.blog-controls');
    const articles = document.querySelector('.articles');
    if (!controls || !articles) return;

    const lifecycle = new AbortController();
    const groups = Array.from(articles.querySelectorAll('.year-group'));
    const posts = Array.from(articles.querySelectorAll('.article'));
    const tags = new Map(posts.map(post => [post, JSON.parse(post.dataset.tags)]));
    const filters = Array.from(controls.querySelectorAll('.tag-filter'));
    const sort = document.getElementById('entry-sort');
    const count = document.getElementById('entry-count');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set();
    const folds = new Map();
    const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
    let revision = 0;
    let selectedTag = savedState?.tag || '';
    if (savedState) {
      sort.value = savedState.sort;
      groups.forEach(group => {
        group.open = savedState.years[group.dataset.year] ?? group.open;
      });
    }

    function canAnimate() {
      return !reducedMotion.matches && typeof articles.animate === 'function';
    }

    function animate(element, frames, duration = 300, delay = 0) {
      const animation = element.animate(frames, { duration, delay, easing, fill: 'both' });
      animations.add(animation);
      const finished = animation.finished.then(() => true, () => false);
      finished.then(() => {
        animations.delete(animation);
        animation.cancel();
      });
      return { animation, finished };
    }

    function cancelAnimations() {
      animations.forEach(animation => animation.cancel());
      animations.clear();
    }

    function setExpanded(group, expanded) {
      group.open = expanded;
      group.dataset.expanded = String(expanded);
      group.querySelector('summary').setAttribute('aria-expanded', String(expanded));
    }

    function settleFold(group) {
      const fold = folds.get(group);
      if (!fold) return;
      folds.delete(group);
      setExpanded(group, fold.expanded);
      group.style.overflow = '';
      group.querySelector('.year-articles').inert = false;
      fold.animation.cancel();
    }

    function toggleYear(group) {
      // Settle a pending filter before measuring a fold. Rapid input always wins.
      revision++;
      const previous = folds.get(group);
      const expanded = !(previous ? previous.expanded : group.open);
      const height = group.getBoundingClientRect().height;
      groups.forEach(settleFold);
      cancelAnimations();
      update();
      if (!canAnimate()) {
        setExpanded(group, expanded);
        return;
      }

      const summary = group.querySelector('summary');
      const content = group.querySelector('.year-articles');
      setExpanded(group, true);
      group.dataset.expanded = String(expanded);
      summary.setAttribute('aria-expanded', String(expanded));
      content.inert = !expanded;
      const target = expanded ? group.getBoundingClientRect().height : summary.getBoundingClientRect().height;
      group.style.overflow = 'hidden';
      const motion = animate(group, [{ height: `${height}px` }, { height: `${target}px` }], 320);
      const fold = { expanded, animation: motion.animation };
      folds.set(group, fold);
      motion.finished.then(() => {
        if (folds.get(group) === fold) settleFold(group);
      });
    }

    function capturePositions() {
      const positions = new Map();
      groups.forEach(group => {
        if (group.hidden) return;
        const elements = [group.querySelector('summary')];
        if (group.open) elements.push(...group.querySelectorAll('.article:not([hidden])'));
        elements.forEach(element => positions.set(element, element.getBoundingClientRect()));
      });
      const footer = document.querySelector('.footer');
      if (footer) positions.set(footer, footer.getBoundingClientRect());
      return positions;
    }

    async function transitionUpdate({ revealMatches = false } = {}) {
      const current = ++revision;
      groups.forEach(settleFold);
      const before = capturePositions();
      cancelAnimations();
      if (!canAnimate()) {
        update({ revealMatches });
        return;
      }

      const leaving = posts.filter(post => before.has(post) && selectedTag && !tags.get(post).includes(selectedTag));
      await Promise.all(leaving.map(post => animate(post, [
        { opacity: getComputedStyle(post).opacity, translate: '0px 0px' },
        { opacity: 0, translate: '0px -6px' }
      ], 110).finished));
      if (current !== revision) return;
      update({ revealMatches });

      const after = capturePositions();
      let entering = 0;
      after.forEach((rect, element) => {
        const old = before.get(element);
        const opacity = getComputedStyle(element).opacity;
        if (old) {
          const x = old.left - rect.left;
          const y = old.top - rect.top;
          if (Math.abs(x) + Math.abs(y) > 1) {
            animate(element, [{ translate: `${x}px ${y}px` }, { translate: '0px 0px' }]);
          }
        } else {
          animate(element, [
            { opacity: 0, translate: '0px 10px' },
            { opacity, translate: '0px 0px' }
          ], 260, Math.min(entering++ * 20, 80));
        }
      });
    }

    function update({ revealMatches = false } = {}) {
      let total = 0;
      posts.forEach(post => {
        post.hidden = selectedTag !== '' && !tags.get(post).includes(selectedTag);
        if (!post.hidden) total++;
      });

      const direction = sort.value === 'oldest' ? 1 : -1;
      groups.sort((a, b) => direction * (Number(a.dataset.year) - Number(b.dataset.year)));
      groups.forEach(group => {
        const list = group.querySelector('.year-articles');
        const yearPosts = Array.from(list.querySelectorAll('.article'));
        yearPosts.sort((a, b) => direction * (Number(a.dataset.date) - Number(b.dataset.date)));
        yearPosts.forEach(post => list.appendChild(post));
        const visible = yearPosts.filter(post => !post.hidden).length;
        group.hidden = visible === 0;
        group.querySelector('.year-count').textContent = `${visible} ${visible === 1 ? 'entry' : 'entries'}`;
        if (revealMatches && visible > 0) setExpanded(group, true);
        articles.appendChild(group);
      });

      filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === selectedTag)));
      count.textContent = `${total} ${total === 1 ? 'entry' : 'entries'}${selectedTag ? ` · ${selectedTag}` : ''}`;
    }

    document.querySelector('main').addEventListener('click', event => {
      const button = event.target.closest('button[data-filter]');
      if (!button) return;
      if (selectedTag === button.dataset.filter) return;
      selectedTag = button.dataset.filter;
      filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter.dataset.filter === selectedTag)));
      transitionUpdate({ revealMatches: true });
      // A post may move when filtering; keep keyboard focus on the selected filter.
      filters.find(filter => filter.dataset.filter === selectedTag)?.focus({ preventScroll: true });
    }, { signal: lifecycle.signal });
    groups.forEach(group => {
      setExpanded(group, group.open);
      group.querySelector('summary').addEventListener('click', event => {
        event.preventDefault();
        toggleYear(group);
      }, { signal: lifecycle.signal });
    });
    sort.addEventListener('change', () => transitionUpdate(), { signal: lifecycle.signal });
    reducedMotion.addEventListener('change', () => {
      revision++;
      groups.forEach(settleFold);
      cancelAnimations();
      update();
    }, { signal: lifecycle.signal });
    window.addEventListener('resize', () => {
      revision++;
      groups.forEach(settleFold);
      cancelAnimations();
      update();
    }, { passive: true, signal: lifecycle.signal });
    update();
    controls.hidden = false;
    dispose = () => {
      revision++;
      groups.forEach(settleFold);
      cancelAnimations();
      savedState = {
        tag: selectedTag,
        sort: sort.value,
        years: Object.fromEntries(groups.map(group => [group.dataset.year, group.open]))
      };
      lifecycle.abort();
    };
  }

  document.addEventListener('turbo:render', initializeBlog);
  document.addEventListener('turbo:before-cache', () => dispose());
  document.addEventListener('turbo:before-render', () => dispose());
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBlog, { once: true });
  } else {
    initializeBlog();
  }
})();
