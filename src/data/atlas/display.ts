import type { AreaKey, Tab } from './types';

export const DEFAULT_AREA: AreaKey = 'arch';

export const tabs: { key: Tab; label: string }[] = [
  { key: 'ov', label: '概览' },
  { key: 'tree', label: '研究树' },
  { key: 'tools', label: '工具与方法' },
  { key: 'papers', label: '论文路线' },
];

export const tierClass = (tier: string) => ['A', 'B', 'C'].includes(tier) ? `t${tier}` : 'tN';
export const shortTitle = (title: string) => {
  const words = title.split(':')[0].split(' ');
  return words.slice(0, 4).join(' ') + (words.length > 4 ? '…' : '');
};
