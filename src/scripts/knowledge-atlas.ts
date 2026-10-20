import type { AtlasSearchItem, AtlasTab } from '../data/knowledge-atlas-details';

const normalize = (value: string) => value.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
const tabs: AtlasTab[] = ['ov', 'tree', 'tools', 'papers'];
const storageKey = 'boy-jiang-atlas-selection';

export function initializeKnowledgeAtlas(root: HTMLElement) {
  if (root.dataset.atlasInitialized) return;
  const payload = root.querySelector<HTMLScriptElement>('[data-atlas-index]');
  if (!payload?.textContent) return;
  const index = JSON.parse(payload.textContent) as AtlasSearchItem[];
  root.dataset.atlasInitialized = 'true';
  const cards = [...root.querySelectorAll<HTMLButtonElement>('[data-atlas-area]')];
  const areas = cards.map(card => ({
    key: card.dataset.atlasArea!, title: card.dataset.atlasTitle!,
    neighbors: JSON.parse(card.dataset.atlasNeighbors!) as string[], card,
    panel: root.querySelector<HTMLElement>(`#${card.getAttribute('aria-controls')}`)!,
  }));
  const byKey = new Map(areas.map(area => [area.key, area]));
  const input = root.querySelector<HTMLInputElement>('[data-atlas-query]')!;
  const clear = root.querySelector<HTMLButtonElement>('[data-atlas-clear]')!;
  const feedback = root.querySelector<HTMLElement>('[data-atlas-match]')!;
  const live = root.querySelector<HTMLElement>('[data-atlas-live]')!;
  const resultBox = root.querySelector<HTMLElement>('[data-atlas-results]')!;
  const resultList = root.querySelector<HTMLOListElement>('[data-atlas-result-list]')!;
  const more = root.querySelector<HTMLButtonElement>('[data-atlas-more]')!;
  const conferenceButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-atlas-conf], [data-atlas-quick]')];
  let current = areas.find(area => !area.panel.hidden)?.key ?? areas[0].key;
  let activeTab: AtlasTab = 'ov', method: string | null = null;
  let hits: AtlasSearchItem[] = [], limit = 12;
  const scrollBehavior = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' as const : 'smooth' as const;
  const announce = (message: string) => { live.textContent = message; };
  const focusTarget = (id: string) => {
    const target = root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if (!target) return;
    if (target instanceof HTMLDetailsElement) target.open = true;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
    target.classList.add('atlas-flash');
    window.setTimeout(() => target.classList.remove('atlas-flash'), 1400);
  };
  const filterTools = (value: string | null) => {
    const panel = byKey.get(current)!.panel;
    const methods = [...panel.querySelectorAll<HTMLButtonElement>('[data-atlas-method]')];
    const selected = methods.find(button => button.dataset.atlasMethod === value);
    method = selected ? value : null;
    methods.forEach(button => button.setAttribute('aria-pressed', String(button === selected)));
    let visible = 0;
    panel.querySelectorAll<HTMLElement>('[data-atlas-tool-method]').forEach(card => {
      card.hidden = !!method && card.dataset.atlasToolMethod !== method;
      if (!card.hidden) visible++;
    });
    panel.querySelector<HTMLElement>('[data-atlas-filter-hint]')!.hidden = !method;
    panel.querySelector<HTMLElement>('[data-atlas-filter-name]')!.textContent = selected?.querySelector('strong')?.textContent ?? '';
    panel.querySelector<HTMLElement>('[data-atlas-filter-empty]')!.hidden = visible > 0;
  };
  const activateTab = (tab: AtlasTab, focus = false) => {
    if (!tabs.includes(tab)) return;
    activeTab = tab;
    const panel = byKey.get(current)!.panel;
    panel.querySelectorAll<HTMLButtonElement>('[data-atlas-tab]').forEach(button => {
      const selected = button.dataset.atlasTab === tab;
      button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1;
      if (selected && focus) button.focus();
    });
    panel.querySelectorAll<HTMLElement>('[data-atlas-panel]').forEach(item => { item.hidden = item.dataset.atlasPanel !== tab; });
  };
  const select = (key: string, tab = activeTab, scroll = false) => {
    const area = byKey.get(key);
    if (!area) return;
    const changed = key !== current;
    current = key;
    cards.forEach(card => {
      const selected = card.dataset.atlasArea === key;
      card.classList.toggle('is-selected', selected);
      card.classList.toggle('is-near', !selected && area.neighbors.includes(card.dataset.atlasArea!));
      card.setAttribute('aria-pressed', String(selected));
    });
    areas.forEach(item => { item.panel.hidden = item.key !== key; });
    activateTab(tab);
    if (changed) filterTools(null);
    try { localStorage.setItem(storageKey, key); } catch {}
    if (scroll) focusTarget(`atlas-heading-${key}`);
  };
  const resultButton = (item: AtlasSearchItem, text: string, owner?: string) => {
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.atlasResult = String(item.id); button.textContent = text;
    if (owner) { button.dataset.atlasOwner = owner; button.setAttribute('aria-label', `${item.label} · ${text}`); }
    return button;
  };
  const renderResults = () => {
    resultBox.hidden = !input.value.trim();
    const fragment = document.createDocumentFragment();
    hits.slice(0, limit).forEach(item => {
      const row = document.createElement('li'); row.className = 'atlas-result';
      const head = document.createElement('div'); head.className = 'atlas-result-head';
      const kind = document.createElement('span'); kind.className = 'atlas-result-kind'; kind.textContent = item.kind;
      const title = resultButton(item, item.label); title.className = 'atlas-result-title';
      head.append(kind, title);
      const snippet = document.createElement('p'); snippet.textContent = item.snippet;
      const owners = document.createElement('div'); owners.className = 'atlas-result-owners';
      const label = document.createElement('span'); label.textContent = '所属方向';
      owners.append(label, ...item.owners.map(key => resultButton(item, byKey.get(key)!.title, key)));
      row.append(head, snippet, owners); fragment.append(row);
    });
    resultList.replaceChildren(fragment);
    more.hidden = hits.length <= limit;
    more.textContent = `显示更多（还剩 ${Math.max(0, hits.length - limit)} 条）`;
  };
  const lookup = (exact = false) => {
    const query = normalize(input.value), terms = query.split(' ');
    hits = !query ? [] : index.filter(item => exact ? item.kind === '会议' && item.title === query : terms.every(term => item.text.includes(term)))
      .map(item => ({ item, score: item.title === query ? 1000 : item.title.startsWith(query) ? 700 : item.title.includes(query) ? 500 : terms.filter(term => item.title.includes(term)).length * 100 }))
      .sort((a, b) => b.score - a.score || a.item.id - b.item.id).map(({ item }) => item);
    const keys = new Set(hits.flatMap(item => item.owners));
    cards.forEach(card => {
      card.classList.toggle('is-match', !!query && keys.has(card.dataset.atlasArea!));
      card.classList.toggle('is-dim', !!query && !keys.has(card.dataset.atlasArea!));
    });
    conferenceButtons.forEach(button => {
      const selected = !!query && normalize(button.dataset.atlasConf ?? button.dataset.atlasQuick ?? '') === query;
      button.classList.toggle('is-match', selected); button.setAttribute('aria-pressed', String(selected));
    });
    clear.hidden = !query;
    feedback.textContent = !query ? '' : hits.length ? `「${input.value.trim()}」找到 ${hits.length} 条结果，覆盖 ${keys.size} 个方向。` : `未找到「${input.value.trim()}」，可尝试工具缩写、论文标题或关键词。`;
    limit = 12; renderResults();
  };
  const pickConference = (name: string) => {
    input.value = name; lookup(true); input.focus({ preventScroll: true });
    root.querySelector('.atlas-search')?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  };
  const openResult = (id: number, owner?: string) => {
    const item = index[id];
    if (!item) return;
    if (item.kind === '会议' && !owner) { pickConference(item.label); return; }
    const key = owner && item.owners.includes(owner) ? owner : item.owners.includes(current) ? current : item.owners[0];
    const destination = item.targets[key];
    if (!destination || !byKey.has(key)) return;
    select(key, destination.tab);
    if (destination.tab === 'tools') filterTools(null);
    if (item.kind === '研究方法') {
      const button = root.querySelector<HTMLButtonElement>(`#${CSS.escape(destination.id)}`);
      filterTools(button?.dataset.atlasMethod ?? null);
    }
    focusTarget(destination.id);
    announce(`已定位${byKey.get(key)!.title}的${item.kind}：${item.label}。`);
  };
  root.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>('button');
    if (!button) return;
    const data = button.dataset;
    if (data.atlasResult !== undefined) openResult(Number(data.atlasResult), data.atlasOwner);
    else if (data.atlasArea) select(data.atlasArea, activeTab, window.matchMedia('(max-width: 760px)').matches);
    else if (data.atlasGo) select(data.atlasGo, activeTab, true);
    else if (data.atlasTab) activateTab(data.atlasTab as AtlasTab);
    else if (data.atlasConf) pickConference(data.atlasConf);
    else if (data.atlasQuick) { input.value = input.value === data.atlasQuick ? '' : data.atlasQuick; lookup(true); }
    else if (data.atlasTool) {
      const item = index.find(item => item.kind === '工具' && Object.values(item.targets).some(t => t.id.endsWith(`-${data.atlasTool}`)));
      if (item) openResult(item.id);
    } else if (data.atlasPaper) {
      const item = index.find(item => item.kind === '论文' && item.targets[data.atlasOwner ?? current]?.id === `atlas-paper-${data.atlasOwner ?? current}-${data.atlasPaper}`);
      if (item) openResult(item.id, data.atlasOwner);
    } else if (data.atlasMethod) filterTools(method === data.atlasMethod ? null : data.atlasMethod);
    else if ('atlasFilterClear' in data) {
      const previous = byKey.get(current)!.panel.querySelector<HTMLButtonElement>('[data-atlas-method][aria-pressed="true"]');
      filterTools(null); previous?.focus();
    }
  });
  root.addEventListener('keydown', event => {
    if (!(event.target instanceof Element)) return;
    const tab = event.target.closest<HTMLButtonElement>('[role="tab"]');
    if (!tab) return;
    const i = tabs.indexOf(tab.dataset.atlasTab as AtlasTab);
    const next = event.key === 'ArrowRight' ? (i + 1) % tabs.length : event.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
    if (next >= 0) { event.preventDefault(); activateTab(tabs[next], true); }
  });
  input.addEventListener('input', event => { if (!(event instanceof InputEvent) || !event.isComposing) lookup(); });
  input.addEventListener('compositionend', () => lookup());
  input.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.key === 'Escape') { input.value = ''; lookup(); event.preventDefault(); }
    else if (event.key === 'ArrowDown') { resultList.querySelector<HTMLButtonElement>('.atlas-result-title')?.focus(); event.preventDefault(); }
    else if (event.key === 'Enter' && hits.length) { openResult(hits[0].id); event.preventDefault(); }
  });
  resultList.addEventListener('keydown', event => {
    if (event.key === 'Escape') { input.value = ''; lookup(); input.focus(); event.preventDefault(); return; }
    if (!(event.target instanceof HTMLElement) || !event.target.matches('.atlas-result-title')) return;
    const buttons = [...resultList.querySelectorAll<HTMLButtonElement>('.atlas-result-title')], i = buttons.indexOf(event.target as HTMLButtonElement);
    const target = event.key === 'ArrowUp' ? buttons[i - 1] ?? input : event.key === 'ArrowDown' ? buttons[Math.min(i + 1, buttons.length - 1)] : event.key === 'Home' ? buttons[0] : event.key === 'End' ? buttons.at(-1) : null;
    if (target) { target.focus(); event.preventDefault(); }
  });
  more.addEventListener('click', () => {
    const previous = limit; limit += 12; renderResults();
    resultList.querySelectorAll<HTMLButtonElement>('.atlas-result-title')[previous]?.focus();
    announce(`已显示 ${Math.min(limit, hits.length)} 条搜索结果。`);
  });
  clear.addEventListener('click', () => { input.value = ''; lookup(); input.focus(); });
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved && byKey.has(saved)) select(saved);
  } catch {}
}

function initializeAtlases() {
  document.querySelectorAll<HTMLElement>('[data-knowledge-atlas]').forEach(initializeKnowledgeAtlas);
}
initializeAtlases();
document.addEventListener('astro:page-load', initializeAtlases);
