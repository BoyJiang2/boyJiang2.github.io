import { getCollection, type CollectionEntry } from 'astro:content';
import { getNoteLocation } from './notes';

export { noteHref } from './notes';

export const PUBLIC_NOTE_CATEGORIES = ['论文'];

export async function getPublishedBlogs() {
  return (await getCollection('blog', ({ data }) => data.published))
    .sort((a, b) => a.data.title.localeCompare(b.data.title, 'zh-CN'));
}

export async function getPublishedProjects() {
  return (await getCollection('projects', ({ data }) => data.published))
    .sort((a, b) => a.data.title.localeCompare(b.data.title, 'zh-CN'));
}

export async function getPublishedNotes() {
  const entries = (await getCollection('notes', (entry) => (
    entry.data.published && PUBLIC_NOTE_CATEGORIES.includes(getNoteLocation(entry).category)
  ))).sort((a, b) => a.id.localeCompare(b.id, 'zh-CN'));
  const sources = new Map<string, CollectionEntry<'notes'>>();
  for (const entry of entries) {
    const { slug } = getNoteLocation(entry);
    const previous = sources.get(slug);
    if (previous) {
      throw new Error(`Duplicate published note slug "${slug}": "${previous.filePath ?? previous.id}" and "${entry.filePath ?? entry.id}" would share /notes/${slug}/.`);
    }
    sources.set(slug, entry);
  }
  return entries;
}

export function blogHref(entry: CollectionEntry<'blog'>) {
  return `/blogs/${entry.id}/`;
}

export function projectHref(entry: CollectionEntry<'projects'>) {
  return `/projects/${entry.id}/`;
}
