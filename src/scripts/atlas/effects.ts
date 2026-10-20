export function createEffects(root: HTMLElement) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Set<Animation>();
  const pulses = new WeakMap<HTMLElement, Animation>();
  const panels = new WeakMap<HTMLElement, Animation>();
  const animate = (element: HTMLElement, frames: Keyframe[], duration: number, delay = 0) => {
    if (reduced.matches) return;
    const animation = element.animate(frames, { duration, delay, easing: 'ease-out' });
    running.add(animation);
    const cleanup = () => running.delete(animation);
    animation.onfinish = cleanup;
    animation.oncancel = cleanup;
    return animation;
  };
  const pulse = (element: HTMLElement, color: string, delay = 0) => {
    pulses.get(element)?.cancel();
    const animation = animate(element, [
      { boxShadow: `inset 0 0 0 0 ${color}, 0 0 0 0 transparent` },
      { boxShadow: `inset 0 0 22px -5px ${color}, 0 0 0 2px ${color}`, offset: 0.3 },
      { boxShadow: `inset 0 0 0 0 transparent, 0 0 0 6px transparent` },
    ], 480, delay);
    if (animation) pulses.set(element, animation);
  };
  const color = (name: string) => getComputedStyle(root).getPropertyValue(`--atlas-${name}`).trim();
  const scrollBehavior = (): ScrollBehavior => reduced.matches ? 'instant' : 'smooth';
  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    running.forEach(animation => animation.cancel());
    root.querySelectorAll('.cell-ripple').forEach(ripple => ripple.remove());
  });
  return {
    scrollBehavior,
    ripple(cell: HTMLElement, event: MouseEvent) {
      if (reduced.matches) return;
      const bounds = cell.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'cell-ripple';
      ripple.setAttribute('aria-hidden', 'true');
      const size = Math.hypot(bounds.width, bounds.height) * 2;
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${event.detail ? event.clientX - bounds.left : bounds.width / 2}px`;
      ripple.style.top = `${event.detail ? event.clientY - bounds.top : bounds.height / 2}px`;
      cell.append(ripple);
      const animation = animate(ripple, [
        { transform: 'translate(-50%, -50%) scale(0)', opacity: 0.35 },
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 0 },
      ], 500);
      animation?.finished.then(() => ripple.remove(), () => ripple.remove());
    },
    selection(cell: HTMLElement, neighbors: HTMLElement[]) {
      if (reduced.matches) return;
      pulse(cell, color('copper'));
      neighbors.forEach((neighbor, index) => pulse(neighbor, color('trace'), (index + 1) * 70));
    },
    hits(cells: HTMLElement[]) {
      if (reduced.matches) return;
      cells.forEach((cell, index) => pulse(cell, color('trace'), index * 35));
    },
    panel(panel: HTMLElement) {
      panels.get(panel)?.cancel();
      const animation = animate(panel, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], 220);
      if (animation) panels.set(panel, animation);
    },
    indicator(tablist: HTMLElement) {
      const selected = tablist.querySelector<HTMLElement>('[aria-selected="true"]');
      const indicator = tablist.querySelector<HTMLElement>('.tab-indicator');
      if (!selected || !indicator) return;
      indicator.style.width = `${selected.offsetWidth}px`;
      indicator.style.transform = `translateX(${selected.offsetLeft}px)`;
    },
    jump(target: HTMLElement) {
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
      pulse(target.querySelector<HTMLElement>(':scope > .pcard') ?? target, color('copper'));
    },
  };
}
