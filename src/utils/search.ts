import type { Nodes } from 'mdast';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

const parser = unified().use(remarkParse).use(remarkGfm).use(remarkMath);
const inlineParents = new Set(['paragraph', 'heading', 'link', 'linkReference', 'emphasis', 'strong', 'delete']);
const unescapePunctuation = (text: string) => text.replace(/\\([\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e])/g, '$1');

function readableText(node: Nodes): string {
  if (node.type === 'definition') return '';
  if (node.type === 'text') return unescapePunctuation(node.value);
  if (node.type === 'image' || node.type === 'imageReference') {
    const alt = unescapePunctuation(node.alt ?? '');
    return /^\S+\.(?:png|jpe?g|gif|webp|svg|avif)$/i.test(alt.trim()) ? '' : alt;
  }
  if (node.type === 'html') {
    return node.value.replace(/<!--[\s\S]*?-->|<\/?([A-Za-z][\w.:-]*)(?:"[^"]*"|'[^']*'|[^'">])*>/g, (_, tag) => /^(?:br|div|h[1-6]|li|p|t[dhr])$/i.test(tag) ? ' ' : '');
  }
  if (node.type === 'break') return ' ';
  if ('children' in node) {
    const text = node.children.map(readableText).join(inlineParents.has(node.type) ? '' : ' ');
    return node.type === 'paragraph' ? text.replace(/^(?:import\s+(?:[^\n]+?\sfrom\s*)?['"][^\n]*|export\s+(?:(?:default|const|let|var|function|class)\b|[{*])[^\n]*)(?:\n|$)/gm, ' ') : text;
  }
  return 'value' in node ? node.value : '';
}

export function toSearchText(markdown = '') {
  return readableText(parser.parse(markdown)).replace(/\s+/g, ' ').trim();
}
