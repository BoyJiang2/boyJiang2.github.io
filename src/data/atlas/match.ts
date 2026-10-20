import type { SearchItem } from './types';

export const normalizeSearch = (value: string) => String(value).normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
export const venueHas = (venue: string, name: string) => (` ${normalizeSearch(venue).replace(/[^\p{L}\p{N}]+/gu, ' ')} `).includes(` ${normalizeSearch(name).replace(/[^\p{L}\p{N}]+/gu, ' ')} `);

export function findSearch(items: SearchItem[], value: string, exactConference = false) {
  const query = normalizeSearch(value);
  if (!query) return [];
  const terms = query.split(' ');
  return items.filter(item => exactConference ? item.kind === '会议' && item.title === query : terms.every(term => item.text.includes(term)))
    .map(item => ({
      item,
      score: item.title === query ? 1000 : item.title.startsWith(query) ? 700 : item.title.includes(query) ? 500 : terms.filter(term => item.title.includes(term)).length * 100,
    }))
    .sort((a, b) => b.score - a.score || a.item.id - b.item.id).map(({ item }) => item);
}
