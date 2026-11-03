/* Keep every image visible and fill each gallery row without cropping. */
(() => {
  const galleries = document.querySelectorAll('.project-gallery-flex');
  if (!galleries.length) return;

  function layout(gallery) {
    const images = Array.from(gallery.querySelectorAll('img'));
    if (!images.length || images.some(img => !img.naturalWidth || !img.naturalHeight)) return;

    if (window.innerWidth <= 600) {
      images.forEach(img => {
        img.style.setProperty('width', '100%', 'important');
        img.style.setProperty('height', 'auto', 'important');
        img.style.setProperty('flex', 'none', 'important');
        img.style.setProperty('object-fit', 'contain', 'important');
      });
      return;
    }

    const style = getComputedStyle(gallery);
    const gap = parseFloat(style.columnGap) || 0;
    const width = gallery.clientWidth - gap * (images.length - 1);
    if (width <= 0) return;
    const ratios = images.map(img => img.naturalWidth / img.naturalHeight);
    const height = width / ratios.reduce((sum, ratio) => sum + ratio, 0);

    images.forEach((img, index) => {
      img.style.setProperty('width', `${height * ratios[index]}px`, 'important');
      img.style.setProperty('height', `${height}px`, 'important');
      img.style.setProperty('flex', 'none', 'important');
      img.style.setProperty('object-fit', 'contain', 'important');
    });
  }

  function layoutAll() { galleries.forEach(layout); }
  galleries.forEach(gallery => {
    gallery.querySelectorAll('img').forEach(img => {
      if (!img.complete || !img.naturalWidth) img.addEventListener('load', layoutAll, { once: true });
    });
  });
  layoutAll();
  new ResizeObserver(layoutAll).observe(document.querySelector('.project-gallery-flex').parentElement);
  window.addEventListener('resize', layoutAll);
})();
/* Lightbox: click any project image to view it large. */
(() => {
  const imgs = Array.from(document.querySelectorAll('.project-cover-full, .project-gallery-flex img'));
  if (!imgs.length) return;

  const css = document.createElement('style');
  css.textContent = `
    .project-cover-full, .project-gallery-flex img { cursor: zoom-in; }
    .lb { position: fixed; inset: 0; z-index: 10000; display: none; align-items: center; justify-content: center;
          background: rgba(0,0,0,.92); touch-action: none; }
    .lb.open { display: flex; }
    .lb img { max-width: 94vw; max-height: 92vh; object-fit: contain; cursor: zoom-out; }
    .lb button { position: absolute; background: none; border: 0; color: #fff; font-size: 2rem; line-height: 1;
                 padding: 1rem; cursor: pointer; opacity: .8; }
    .lb button:hover { opacity: 1; }
    .lb .lb-close { top: 0; right: 0; }
    .lb .lb-prev { left: 0; top: 50%; transform: translateY(-50%); }
    .lb .lb-next { right: 0; top: 50%; transform: translateY(-50%); }
    body.lb-lock { overflow: hidden; }
  `;
  document.head.appendChild(css);

  const box = document.createElement('div');
  box.className = 'lb';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.innerHTML = '<button class="lb-close" aria-label="Close">×</button>' +
                  '<button class="lb-prev" aria-label="Previous image">‹</button>' +
                  '<img alt="">' +
                  '<button class="lb-next" aria-label="Next image">›</button>';
  document.body.appendChild(box);
  const view = box.querySelector('img');
  let i = 0;

  function show(n) {
    i = (n + imgs.length) % imgs.length;
    view.src = imgs[i].currentSrc || imgs[i].src;
    view.alt = imgs[i].alt || '';
  }
  function open(n) { show(n); box.classList.add('open'); document.body.classList.add('lb-lock'); }
  function close() { box.classList.remove('open'); document.body.classList.remove('lb-lock'); }

  imgs.forEach((img, n) => img.addEventListener('click', () => open(n)));
  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); show(i - 1); });
  box.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); show(i + 1); });
  box.addEventListener('click', e => { if (e.target === box || e.target === view) close(); });

  document.addEventListener('keydown', e => {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  });

  let x0 = null;
  box.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive: true });
})();
