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
