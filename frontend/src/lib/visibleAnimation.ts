/** Run decorative animation only while its surface is visible. */
export function visibleAnimation(element: Element, draw: (time: number) => void) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let intersecting = false;
  let frame = 0;

  const tick = (time: number) => {
    frame = 0;
    draw(time);
    if (!motion.matches) frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (intersecting && !document.hidden) frame = requestAnimationFrame(tick);
  };
  const observer = new IntersectionObserver(([entry]) => {
    intersecting = entry.isIntersecting;
    sync();
  });
  observer.observe(element);
  document.addEventListener("visibilitychange", sync);
  motion.addEventListener("change", sync);
  // A static frame must still reflect a theme change with reduced motion.
  const themeObserver = new MutationObserver(() => {
    if (motion.matches) sync();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    themeObserver.disconnect();
    document.removeEventListener("visibilitychange", sync);
    motion.removeEventListener("change", sync);
  };
}
