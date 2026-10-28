import type { CollectionEntry } from 'astro:content';
import type { TreeNode } from '../components/ContentTree.astro';

const categoryIcons: Record<string, string> = { '课程': '▤', '论文': '◈', '技术': '⌘', '工具': '✺' };

export interface NoteSource {
  id: string;
  filePath?: string;
}

export function noteHref(entry: CollectionEntry<'notes'>) {
  return `/notes/${getNoteLocation(entry).slug}/`;
}

export function buildNoteTree(entries: CollectionEntry<'notes'>[], currentId: string): TreeNode[] {
  const located = entries.map((entry) => ({ entry, location: getNoteLocation(entry) }));
  const currentLocation = located.find(({ entry }) => entry.id === currentId)?.location;
  const categories = [...new Set(located.map(({ location }) => location.category))];
  return categories.map((category) => {
    const categoryEntries = located.filter(({ location }) => location.category === category);
    const children = categoryEntries.map(({ entry }) => ({
      label: entry.data.title,
      href: noteHref(entry),
      current: entry.id === currentId,
    }));
    return { label: category, icon: categoryIcons[category] ?? '•', children, open: category === currentLocation?.category };
  });
}

export function getNoteLocation(entry: NoteSource) {
  const source = entry.filePath?.replaceAll('\\', '/') ?? entry.id;
  const relativePath = source.split('/notes/').at(-1) ?? entry.id;
  const folders = relativePath.split('/').slice(0, -1);

  return {
    category: folders[0] ?? '其他',
    series: folders[1] ?? '独立笔记',
    slug: entry.id.split('/').at(-1) ?? entry.id,
  };
}
