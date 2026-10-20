import content from './knowledge-atlas-details.json';
import { atlasAreas } from './knowledge-atlas';

export type AtlasTab = 'ov' | 'tree' | 'tools' | 'papers';
export interface AtlasPaper {
  id: string; st: number; br: string; t: string; au: string; ve: string; yr: number;
  tier: string; q: string; c: string; why: string; learn: string; src: string;
}
interface AtlasMethod { id: string; n: string; eg: string; pro: string; con: string }
interface AtlasBranch {
  id: string; n: string; en: string; d: string; l: [string, string?][];
  tools: string[]; papers: string[];
}
interface AtlasTool {
  n: string; use: string; can: string; lim: string; val: string;
  v: 'ok' | 'part' | 'none'; vn?: string; src: [string, string][];
}
export interface AtlasDetail {
  tree: AtlasBranch[]; methods: AtlasMethod[]; addon?: AtlasMethod;
  tools: [string, string][]; papers: AtlasPaper[]; after: string;
  start: { courses: [string, string?][]; project: string }; journals: [string, string][];
}
export interface AtlasSearchItem {
  id: number; kind: string; label: string; owners: string[]; title: string; text: string; snippet: string;
  targets: Record<string, { tab: AtlasTab; id: string }>;
}

// Server-only source data. The browser receives the compact search index, not this dataset.
export const atlasDetails = content.details as unknown as Record<string, AtlasDetail>;
export const atlasTools = content.tools as unknown as Record<string, AtlasTool>;
export const atlasStages = content.stages;
export const atlasVerification = content.verification;
export const atlasAreaByKey = new Map(atlasAreas.map(area => [area.key, area]));
export const atlasPapers = new Map(Object.entries(atlasDetails).flatMap(([key, d]) => d.papers.map(p => [p.id, { ...p, area: key }] as const)));
export const atlasToolAreas = new Map(Object.keys(atlasTools).map(id => [id, atlasAreas.filter(a => atlasDetails[a.key].tools.some(([t]) => t === id)).map(a => a.key)]));
export const atlasTabs: [AtlasTab, string][] = [['ov', '概览'], ['tree', '研究树'], ['tools', '工具与方法'], ['papers', '论文路线']];
export const atlasTierClass = (tier: string) => `atlas-tier-${['A', 'B', 'C'].includes(tier) ? tier : 'none'}`;
export const atlasShortTitle = (title: string) => {
  const words = title.split(':')[0].split(' ');
  return words.slice(0, 4).join(' ') + (words.length > 4 ? '…' : '');
};
const normalize = (value: string) => value.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
const venueHas = (venue: string, name: string) => (` ${normalize(venue).replace(/[^\p{L}\p{N}]+/gu, ' ')} `).includes(` ${normalize(name).replace(/[^\p{L}\p{N}]+/gu, ' ')} `);
const target = (prefix: string, owner: string, id?: string) => `atlas-${prefix}-${owner}${id ? `-${id}` : ''}`;

export function buildAtlasSearchIndex(): AtlasSearchItem[] {
  const items: AtlasSearchItem[] = [];
  const add = (kind: string, label: string, owners: string[], tab: AtlasTab, prefix: string, id: string | undefined, body: string, snippet: string) => {
    const item: AtlasSearchItem = {
      id: items.length, kind, label, owners, title: normalize(label),
      text: normalize([kind, label, body, ...owners.map(k => `${atlasAreaByKey.get(k)!.title} ${atlasAreaByKey.get(k)!.english}`)].join(' ')),
      snippet: snippet.length > 140 ? `${snippet.slice(0, 140)}…` : snippet,
      targets: Object.fromEntries(owners.map(k => [k, { tab, id: target(prefix, k, id) }])),
    };
    items.push(item);
    return item;
  };
  atlasAreas.forEach(a => {
    const k = a.key, d = atlasDetails[k];
    add('方向', `${a.title} · ${a.english}`, [k], 'ov', 'heading', undefined, [a.summary, ...a.topics, ...a.hot, k === 'mlsys' ? '机器学习系统' : ''].join(' '), a.summary);
    d.tree.forEach(b => add('研究分支', `${b.n} · ${b.en}`, [k], 'tree', 'branch', b.id, [b.d, ...b.l.map(([label]) => label)].join(' '), b.d));
    [...d.methods, ...(d.addon ? [d.addon] : [])].forEach(m => add('研究方法', m.n, [k], 'tools', 'method', m.id, [m.eg, m.pro, m.con].join(' '), `${m.eg}；${m.pro}`));
    d.papers.forEach(p => add('论文', p.t, [k], 'papers', 'paper', p.id, [p.id, p.au, p.ve, p.yr, p.q, p.c, p.why, p.learn].join(' '), `${p.au} · ${p.ve} ${p.yr}；${p.q}`));
    d.start.courses.forEach(([label], i) => add('入门课程', label, [k], 'papers', 'course', String(i), label, '课程入口位于该方向的论文路线顶部。'));
    add('动手项目', `${a.title}：第一个动手项目`, [k], 'papers', 'project', undefined, d.start.project, d.start.project);
  });
  Object.entries(atlasTools).forEach(([id, t]) => {
    const owners = atlasToolAreas.get(id)!;
    add('工具', t.n, owners, 'tools', 'tool', id, [id, t.use, t.can, t.lim, t.val, ...t.src.map(([label]) => label)].join(' '), t.use);
  });
  for (const kind of ['会议', '期刊']) {
    const venues = new Map<string, { owners: string[]; notes: Set<string> }>();
    atlasAreas.forEach(a => {
      const entries = kind === '会议' ? a.conferences.map(c => [c.name, c.note]) : atlasDetails[a.key].journals.map(([name]) => [name, '']);
      entries.forEach(([name, note]) => {
        if (!venues.has(name)) venues.set(name, { owners: [], notes: new Set() });
        const entry = venues.get(name)!;
        entry.owners.push(a.key);
        if (note) entry.notes.add(note);
      });
    });
    venues.forEach(({ owners, notes }, name) => {
      atlasAreas.forEach(a => {
        if (!owners.includes(a.key) && atlasDetails[a.key].papers.some(p => venueHas(p.ve, name))) owners.push(a.key);
      });
      const item = add(kind, name, owners, 'ov', 'heading', undefined, [name, ...notes].join(' '), `覆盖该${kind}的方向与文献；可指定方向查看。`);
      owners.forEach(k => {
        const listed = kind === '会议' ? atlasAreaByKey.get(k)!.conferences.some(c => c.name === name) : atlasDetails[k].journals.some(([j]) => j === name);
        const paper = !listed && atlasDetails[k].papers.find(p => venueHas(p.ve, name));
        if (paper) item.targets[k] = { tab: 'papers', id: target('paper', k, paper.id) };
      });
    });
  }
  return items;
}
