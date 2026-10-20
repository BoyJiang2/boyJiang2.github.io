import { areas, areaByKey, tools, toolAreas } from './index';
import { normalizeSearch, venueHas } from './match';
import type { AreaKey, SearchItem, SearchKind, Tab } from './types';

export function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [];
  const add = (kind: SearchKind, label: string, owners: AreaKey[], tab: Tab, target: string | null, body: string, snippet: string) => {
    items.push({
      id: items.length, kind, label, owners, tab, target, snippet,
      title: normalizeSearch(label),
      text: normalizeSearch([kind, label, body, ...owners.map(key => `${areaByKey[key].name} ${areaByKey[key].abbr}`)].join(' ')),
    });
  };
  for (const area of areas) {
    const owners = [area.key];
    add('方向', `${area.name} · ${area.abbr}`, owners, 'ov', null, [area.english, area.summary, ...area.topics, ...area.hot].join(' '), area.summary);
    area.branches.forEach(branch => add('研究分支', `${branch.name} · ${branch.english}`, owners, 'tree', branch.id, [branch.description, ...branch.leaves.map(leaf => leaf.text)].join(' '), branch.description));
    [...area.methods, ...(area.addon ? [area.addon] : [])].forEach(method => add('研究方法', method.name, owners, 'tools', method.id, [method.examples, method.pros, method.cons].join(' '), `${method.examples}；${method.pros}`));
    area.papers.forEach(paper => add('论文', paper.title, owners, 'papers', paper.id, [paper.id, paper.authors, paper.venue, paper.year, paper.question, paper.contribution, paper.whyRead, paper.takeaway].join(' '), `${paper.authors} · ${paper.venue} ${paper.year}；${paper.question}`));
    area.start.courses.forEach((course, index) => add('入门课程', course.title, owners, 'papers', String(index), course.title, '课程入口位于该方向的论文路线顶部。'));
    add('动手项目', `${area.name}：第一个动手项目`, owners, 'papers', null, area.start.project, area.start.project);
  }
  for (const [id, tool] of Object.entries(tools)) {
    const owners = toolAreas.get(id);
    if (!owners?.length) continue;
    add('工具', tool.name, owners, 'tools', id, [id, tool.use, tool.capabilities, tool.limitations, tool.validation, ...tool.sources.map(source => source.label)].join(' '), tool.use);
  }
  for (const kind of ['会议', '期刊'] as const) {
    const venues = new Map<string, { owners: AreaKey[]; notes: Set<string> }>();
    for (const area of areas) {
      const entries = kind === '会议' ? area.conferences : area.journals;
      for (const entry of entries) {
        if (!venues.has(entry.name)) venues.set(entry.name, { owners: [], notes: new Set() });
        const venue = venues.get(entry.name)!;
        venue.owners.push(area.key);
        if ('note' in entry && typeof entry.note === 'string' && entry.note) venue.notes.add(entry.note);
      }
    }
    venues.forEach(({ owners, notes }, name) => {
      areas.forEach(area => {
        if (area.papers.some(paper => venueHas(paper.venue, name)) && !owners.includes(area.key)) owners.push(area.key);
      });
      add(kind, name, owners, 'ov', name, [name, ...notes].join(' '), kind === '会议' ? '覆盖该会议的方向与文献；选择方向可查看定位。' : '覆盖该期刊的方向与文献；选择方向可查看定位。');
    });
  }
  return items;
}
