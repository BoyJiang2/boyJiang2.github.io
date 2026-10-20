import { mlsys } from './areas/mlsys';
import { db } from './areas/db';
import { edge } from './areas/edge';
import { dist } from './areas/dist';
import { hpc } from './areas/hpc';
import { stor } from './areas/stor';
import { net } from './areas/net';
import { os } from './areas/os';
import { cloud } from './areas/cloud';
import { comp } from './areas/comp';
import { arch } from './areas/arch';
import { eda } from './areas/eda';
import { sec } from './areas/sec';
import { rel } from './areas/rel';
import { energy } from './areas/energy';
import { tools } from './tools';
import type { Area, AreaKey, LayerKey, Paper, Tool } from './types';

export { layers } from './layers';
export { DEFAULT_AREA } from './display';
export { tools } from './tools';
export { journalTiers, verificationBadges, stageNames } from './venues';

export const areas: Area[] = [mlsys, db, edge, dist, hpc, stor, net, os, cloud, comp, arch, eda, sec, rel, energy];
export const areaByKey = Object.fromEntries(areas.map(area => [area.key, area])) as Record<AreaKey, Area>;
export const paperById = new Map<string, Paper>();
export const paperArea = new Map<string, AreaKey>();
// Preserve the original document's DD order: it determines the default owner for cross-area tool references.
const detailOrder: Area[] = [arch, eda, os, cloud, comp, dist, hpc, stor, net, sec, rel, energy, mlsys, db, edge];
export const toolAreas = new Map(Object.keys(tools).map(id => [id, detailOrder.filter(area => area.toolRefs.some(ref => ref.tool === id)).map(area => area.key)]));
const numberingOrder: LayerKey[] = ['hw', 'sw', 'scale', 'apps', 'rail'];
export const cellNumbers = Object.fromEntries(numberingOrder.flatMap(layer => areas.filter(area => area.layer === layer)).map((area, index) => [area.key, String(index + 1).padStart(2, '0')])) as Record<AreaKey, string>;

export function validateAtlas(entries: Area[], library: Record<string, Tool>) {
  const keys = new Set(entries.map(area => area.key));
  const papers = new Set<string>();
  const requireRef = (valid: boolean, location: string, reference: string) => {
    if (!valid) throw new Error(`知识图谱引用无效：${location} → ${reference}`);
  };
  for (const area of entries) {
    for (const paper of area.papers) {
      if (papers.has(paper.id)) throw new Error(`知识图谱论文 ID 重复：${paper.id}（${area.key}）`);
      papers.add(paper.id);
    }
  }
  for (const area of entries) {
    const methods = new Set([...area.methods, ...(area.addon ? [area.addon] : [])].map(method => method.id));
    const branches = new Set(area.branches.map(branch => branch.id));
    area.neighbors.forEach(key => requireRef(keys.has(key), `${area.key}.neighbors`, key));
    requireRef(keys.has(area.nextArea), `${area.key}.nextArea`, area.nextArea);
    for (const branch of area.branches) {
      const location = `${area.key}.branches.${branch.id}`;
      branch.leaves.forEach(leaf => {
        if (leaf.crossArea) requireRef(keys.has(leaf.crossArea), `${location}.leaves`, leaf.crossArea);
      });
      branch.tools.forEach(id => requireRef(Object.hasOwn(library, id), `${location}.tools`, id));
      branch.papers.forEach(id => requireRef(papers.has(id), `${location}.papers`, id));
    }
    area.toolRefs.forEach(ref => {
      requireRef(Object.hasOwn(library, ref.tool), `${area.key}.toolRefs`, ref.tool);
      requireRef(methods.has(ref.method), `${area.key}.toolRefs.${ref.tool}.method`, ref.method);
    });
    area.papers.forEach(paper => requireRef(branches.has(paper.branch), `${area.key}.papers.${paper.id}.branch`, paper.branch));
  }
}

validateAtlas(areas, tools);
for (const area of areas) {
  for (const paper of area.papers) {
    paperById.set(paper.id, paper);
    paperArea.set(paper.id, area.key);
  }
}
