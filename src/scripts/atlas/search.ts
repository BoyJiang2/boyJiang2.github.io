import { findSearch, normalizeSearch } from '../../data/atlas/match';
import type { AreaKey, SearchItem } from '../../data/atlas/types';

interface SearchOptions {
  names: Map<AreaKey, string>;
  open: (item: SearchItem, owner?: AreaKey) => void;
  hits: (cells: HTMLElement[]) => void;
  announce: (message: string) => void;
  scrollBehavior: () => ScrollBehavior;
}

export function initializeSearch(root: HTMLElement, options: SearchOptions) {
  const input = root.querySelector<HTMLInputElement>('#atlas-query')!;
  const status = root.querySelector<HTMLElement>('#atlas-matchinfo')!;
  const clear = root.querySelector<HTMLButtonElement>('[data-clear-query]')!;
  const results = root.querySelector<HTMLElement>('#atlas-search-results')!;
  const list = root.querySelector<HTMLOListElement>('[data-result-list]')!;
  const more = root.querySelector<HTMLButtonElement>('[data-search-more]')!;
  const cells = [...root.querySelectorAll<HTMLElement>('[data-area-cell]')];
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-conf], [data-q]')];
  let index: SearchItem[] | undefined;
  let loading: Promise<SearchItem[]> | undefined;
  let hits: SearchItem[] = [];
  let limit = 12;
  let revision = 0;

  async function loadIndex() {
    if (index) return index;
    if (!loading) {
      status.textContent = '正在加载搜索索引…';
      results.setAttribute('aria-busy', 'true');
      loading = fetch('/knowledge-atlas/search-index.json').then(response => {
        if (!response.ok) throw new Error(`搜索索引加载失败：${response.status}`);
        return response.json() as Promise<SearchItem[]>;
      }).then(items => {
        index = items;
        if (!input.value.trim()) status.textContent = '';
        return items;
      }).catch((error: unknown) => {
        status.textContent = '搜索索引加载失败，请重试。';
        throw error;
      }).finally(() => {
        loading = undefined;
        results.removeAttribute('aria-busy');
      });
    }
    return loading;
  }

  function resultButton(item: SearchItem, owner?: AreaKey) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.result = String(item.id);
    button.textContent = owner ? options.names.get(owner)! : item.label;
    if (owner) {
      button.dataset.owner = owner;
      button.setAttribute('aria-label', `${item.label} · ${options.names.get(owner)}`);
    } else button.className = 'result-title';
    return button;
  }

  function render() {
    results.hidden = !input.value.trim();
    const cards = hits.slice(0, limit).map(item => {
      const card = document.createElement('li');
      card.className = 'result-card';
      const head = document.createElement('div');
      head.className = 'result-head';
      const kind = document.createElement('span');
      kind.className = 'result-kind';
      kind.textContent = item.kind;
      head.append(kind, resultButton(item));
      const snippet = document.createElement('p');
      snippet.textContent = item.snippet.length > 140 ? `${item.snippet.slice(0, 140)}…` : item.snippet;
      const owners = document.createElement('div');
      owners.className = 'result-owners';
      const label = document.createElement('span');
      label.textContent = '所属方向';
      owners.append(label, ...item.owners.map(owner => resultButton(item, owner)));
      card.append(head, snippet, owners);
      return card;
    });
    list.replaceChildren(...cards);
    more.hidden = hits.length <= limit;
    more.textContent = `显示更多（还剩 ${Math.max(0, hits.length - limit)} 条）`;
  }

  async function lookup(value: string, exactConference = false) {
    const request = ++revision;
    const query = normalizeSearch(value);
    clear.hidden = !query;
    cells.forEach(cell => cell.classList.remove('match', 'dim'));
    chips.forEach(chip => {
      const selected = !!query && normalizeSearch(chip.dataset.conf || chip.dataset.q || '') === query;
      chip.classList.toggle('sel', selected);
      chip.setAttribute('aria-pressed', String(selected));
    });
    hits = [];
    limit = 12;
    results.hidden = true;
    if (!query) {
      list.replaceChildren();
      status.textContent = '';
      return;
    }
    let items: SearchItem[];
    try { items = await loadIndex(); } catch { return; }
    if (request !== revision) return;
    hits = findSearch(items, value, exactConference);
    render();
    const owners = new Set(hits.flatMap(item => item.owners));
    const matched: HTMLElement[] = [];
    cells.forEach(cell => {
      const match = owners.has(cell.dataset.areaCell as AreaKey);
      cell.classList.add(match ? 'match' : 'dim');
      if (match) matched.push(cell);
    });
    options.hits(matched);
    status.textContent = hits.length ? `「${input.value.trim()}」找到 ${hits.length} 条结果，覆盖 ${owners.size} 个方向。` : `未找到「${input.value.trim()}」，可尝试工具缩写、论文标题或关键词。`;
  }

  function toggleConference(name: string) {
    input.value = input.value === name ? '' : name;
    void lookup(input.value, true);
  }

  function pickConference(name: string) {
    input.value = name;
    void lookup(input.value, true);
    input.focus({ preventScroll: true });
    root.querySelector<HTMLElement>('.search')!.scrollIntoView({ behavior: options.scrollBehavior(), block: 'start' });
  }

  function open(item: SearchItem, owner?: AreaKey) {
    if (item.kind === '会议' && !owner) pickConference(item.label);
    else options.open(item, owner);
  }

  function clearSearch() {
    input.value = '';
    void lookup('');
    input.focus({ preventScroll: true });
  }

  input.addEventListener('focus', () => { void loadIndex().catch(() => {}); });
  input.addEventListener('input', event => {
    if (!(event as InputEvent).isComposing) void lookup(input.value);
  });
  input.addEventListener('compositionend', () => { void lookup(input.value); });
  input.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.key === 'Escape') {
      clearSearch();
      event.preventDefault();
    } else if (event.key === 'ArrowDown') {
      list.querySelector<HTMLButtonElement>('.result-title')?.focus();
      event.preventDefault();
    } else if (event.key === 'Enter' && hits.length) {
      open(hits[0]);
      event.preventDefault();
    }
  });
  list.addEventListener('click', event => {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('[data-result]') : null;
    const item = button && index?.[Number(button.dataset.result)];
    if (item) open(item, button.dataset.owner as AreaKey | undefined);
  });
  list.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.key === 'Escape') {
      clearSearch();
      event.preventDefault();
      return;
    }
    if (!(event.target instanceof HTMLButtonElement) || !event.target.matches('.result-title')) return;
    const buttons = [...list.querySelectorAll<HTMLButtonElement>('.result-title')];
    const position = buttons.indexOf(event.target);
    const target = event.key === 'ArrowUp' ? buttons[position - 1] || input
      : event.key === 'ArrowDown' ? buttons[Math.min(position + 1, buttons.length - 1)]
      : event.key === 'Home' ? buttons[0] : event.key === 'End' ? buttons[buttons.length - 1] : null;
    if (target) {
      target.focus();
      event.preventDefault();
    }
  });
  more.addEventListener('click', () => {
    const previous = limit;
    limit += 12;
    render();
    list.querySelectorAll<HTMLButtonElement>('.result-title')[previous]?.focus();
    options.announce(`已显示 ${Math.min(limit, hits.length)} 条搜索结果。`);
  });
  clear.addEventListener('click', clearSearch);
  return { toggleConference, pickConference };
}
