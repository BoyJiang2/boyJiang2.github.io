import { DEFAULT_AREA, tabs } from '../../data/atlas/display';
import type { AreaKey, SearchItem, Tab } from '../../data/atlas/types';
import { createEffects } from './effects';
import { venueHas } from '../../data/atlas/match';
import { initializeSearch } from './search';

function initializeAtlas(root: HTMLElement) {
  if (root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  const cells = [...root.querySelectorAll<HTMLButtonElement>('[data-area-cell]')];
  const areas = new Map([...root.querySelectorAll<HTMLElement>('[data-area]')].map(area => [area.dataset.area as AreaKey, area]));
  const cellByKey = new Map(cells.map(cell => [cell.dataset.areaCell as AreaKey, cell]));
  const names = new Map(cells.map(cell => [cell.dataset.areaCell as AreaKey, cell.dataset.name!]));
  const detail = root.querySelector<HTMLElement>('#atlas-detail')!;
  const live = root.querySelector<HTMLElement>('#atlas-status')!;
  const effects = createEffects(root);
  const storageKey = 'boy-jiang-atlas-selection';
  let currentArea: AreaKey = DEFAULT_AREA;
  let currentTab: Tab = 'ov';
  let methodFilter: string | null = null;
  const activeArea = () => areas.get(currentArea)!;
  const findTarget = (suffix: string) => root.querySelector<HTMLElement>(`#${CSS.escape(`atlas-${currentArea}-${suffix}`)}`);
  const announce = (message: string) => { live.textContent = message; };

  function updateFilter() {
    const panel = findTarget('panel-tools')!;
    const methods = [...panel.querySelectorAll<HTMLButtonElement>('[data-method-filter]')];
    const method = methods.find(button => button.dataset.methodFilter === methodFilter);
    if (!method) methodFilter = null;
    methods.forEach(button => button.setAttribute('aria-pressed', String(button === method)));
    let count = 0;
    panel.querySelectorAll<HTMLElement>('[data-method]').forEach(card => {
      card.hidden = !!methodFilter && card.dataset.method !== methodFilter;
      if (!card.hidden) count++;
    });
    panel.querySelector<HTMLElement>('[data-filter-hint]')!.hidden = !methodFilter;
    panel.querySelector<HTMLElement>('[data-filter-name]')!.textContent = method?.dataset.methodName || '';
    panel.querySelector<HTMLElement>('[data-filter-empty]')!.hidden = count > 0;
  }

  function showTab(animate: boolean) {
    const area = activeArea();
    area.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(button => {
      const selected = button.dataset.tab === currentTab;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    const selectedPanel = findTarget(`panel-${currentTab}`)!;
    area.querySelectorAll<HTMLElement>('[role="tabpanel"]').forEach(panel => { panel.hidden = panel !== selectedPanel; });
    updateFilter();
    effects.indicator(area.querySelector<HTMLElement>('.tabs')!);
    if (animate) effects.panel(selectedPanel);
  }

  function select(key: AreaKey, scroll = false, tab = currentTab, animate = true) {
    if (!areas.has(key)) return;
    const changed = currentArea !== key;
    if (changed) methodFilter = null;
    currentArea = key;
    currentTab = tab;
    areas.forEach((area, areaKey) => { area.hidden = areaKey !== key; });
    if (changed) activeArea().querySelectorAll<HTMLDetailsElement>('.branch').forEach(branch => { branch.open = true; });
    const cell = cellByKey.get(key)!;
    const neighbors = cell.dataset.neighbors!.split(' ') as AreaKey[];
    cells.forEach(button => {
      const selected = button === cell;
      button.classList.toggle('on', selected);
      button.classList.toggle('near', !selected && neighbors.includes(button.dataset.areaCell as AreaKey));
      button.setAttribute('aria-pressed', String(selected));
    });
    detail.setAttribute('aria-labelledby', `atlas-${key}-heading`);
    showTab(animate);
    try { localStorage.setItem(storageKey, key); } catch {}
    if (changed) announce(`已切换到${cell.dataset.name}（${cell.dataset.abbr}），${tabs.find(tab => tab.key === currentTab)!.label}。`);
    if (animate) effects.selection(cell, neighbors.map(neighbor => cellByKey.get(neighbor)!));
    if (scroll) {
      findTarget('heading')!.focus({ preventScroll: true });
      detail.scrollIntoView({ behavior: effects.scrollBehavior(), block: 'start' });
    }
  }

  function openResult(item: SearchItem, owner?: AreaKey) {
    const key = owner && item.owners.includes(owner) ? owner : item.owners.includes(currentArea) ? currentArea : item.owners[0];
    const area = areas.get(key)!;
    const isVenue = item.kind === '会议' || item.kind === '期刊';
    const listed = isVenue && [...area.querySelectorAll<HTMLElement>(item.kind === '会议' ? '[data-conf]' : '[data-journal]')].some(entry => (entry.dataset.conf || entry.dataset.journal) === item.label);
    const venuePaper = isVenue && !listed ? [...area.querySelectorAll<HTMLElement>('[data-venue]')].find(paper => venueHas(paper.dataset.venue!, item.label)) : undefined;
    if (item.tab === 'tools') methodFilter = null;
    select(key, false, venuePaper ? 'papers' : item.tab);
    let target: HTMLElement | null = venuePaper ?? null;
    if (!target) {
      if (item.kind === '工具') target = findTarget(`tool-${item.target}`);
      else if (item.kind === '论文') target = findTarget(`paper-${item.target}`);
      else if (item.kind === '研究分支') {
        target = findTarget(`branch-${item.target}`);
        if (target instanceof HTMLDetailsElement) target.open = true;
      } else if (item.kind === '入门课程') target = findTarget(`course-${item.target}`);
      else if (item.kind === '动手项目') target = findTarget('project');
      else if (item.kind === '研究方法') {
        methodFilter = item.target;
        updateFilter();
        target = [...activeArea().querySelectorAll<HTMLElement>('[data-method-filter]')].find(button => button.dataset.methodFilter === item.target) ?? null;
      }
    }
    effects.jump(target ?? findTarget('heading')!);
    announce(`已定位${names.get(key)}的${item.kind}：${item.label}。`);
  }

  const search = initializeSearch(root, { names, open: openResult, hits: effects.hits, announce, scrollBehavior: effects.scrollBehavior });
  root.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const tab = target.closest<HTMLButtonElement>('[data-tab]');
    if (tab) {
      currentTab = tab.dataset.tab as Tab;
      showTab(true);
      return;
    }
    const tool = target.closest<HTMLButtonElement>('[data-tool]');
    if (tool) {
      const owners = tool.dataset.owners!.split(' ') as AreaKey[];
      methodFilter = null;
      select(owners.includes(currentArea) ? currentArea : owners[0], false, 'tools');
      effects.jump(findTarget(`tool-${tool.dataset.tool}`)!);
      return;
    }
    const paper = target.closest<HTMLButtonElement>('[data-paper]');
    if (paper) {
      select(paper.dataset.owner as AreaKey, false, 'papers');
      effects.jump(findTarget(`paper-${paper.dataset.paper}`)!);
      return;
    }
    const method = target.closest<HTMLButtonElement>('[data-method-filter]');
    if (method) {
      methodFilter = methodFilter === method.dataset.methodFilter ? null : method.dataset.methodFilter!;
      updateFilter();
      announce(methodFilter ? '已按研究方法筛选工具。' : '已显示全部工具。');
      return;
    }
    if (target.closest('[data-clear-method]')) {
      const previous = activeArea().querySelector<HTMLButtonElement>('[data-method-filter][aria-pressed="true"]');
      methodFilter = null;
      updateFilter();
      previous?.focus();
      announce('已显示全部工具。');
      return;
    }
    const cell = target.closest<HTMLButtonElement>('[data-area-cell]');
    if (cell) {
      effects.ripple(cell, event);
      select(cell.dataset.areaCell as AreaKey, window.innerWidth < 760);
      return;
    }
    const go = target.closest<HTMLButtonElement>('[data-go]');
    if (go) {
      select(go.dataset.go as AreaKey, true);
      return;
    }
    const quickChip = target.closest<HTMLButtonElement>('[data-q]');
    if (quickChip) {
      search.toggleConference(quickChip.dataset.q!);
      return;
    }
    const conference = target.closest<HTMLButtonElement>('[data-conf]');
    if (conference) search.pickConference(conference.dataset.conf!);
  });
  root.addEventListener('keydown', event => {
    if (event.isComposing) return;
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('[role="tab"]') : null;
    if (!button) return;
    const index = tabs.findIndex(tab => tab.key === button.dataset.tab);
    const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault();
    currentTab = tabs[next].key;
    showTab(true);
    findTarget(`tab-${currentTab}`)!.focus();
  });
  let start: AreaKey = DEFAULT_AREA;
  try {
    const saved = localStorage.getItem(storageKey) as AreaKey | null;
    if (saved && areas.has(saved)) start = saved;
  } catch {}
  select(start, false, 'ov', false);
  new ResizeObserver(() => effects.indicator(activeArea().querySelector<HTMLElement>('.tabs')!)).observe(detail);
  void document.fonts.ready.then(() => effects.indicator(activeArea().querySelector<HTMLElement>('.tabs')!));
}

function initializeAtlases() {
  document.querySelectorAll<HTMLElement>('[data-knowledge-atlas]').forEach(initializeAtlas);
}

initializeAtlases();
document.addEventListener('astro:page-load', initializeAtlases);
