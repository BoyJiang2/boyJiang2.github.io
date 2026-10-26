import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import remarkDisplayMath from '../src/utils/remark-display-math.mjs';

const note = fs.readFileSync(new URL('../src/content/notes/论文/并行集群部署/并行集群部署.md', import.meta.url), 'utf8');
const parser = unified().use(remarkParse).use(remarkGfm).use(remarkMath);
const normalize = source => parser.runSync(remarkDisplayMath()(parser.parse(source)));
const render = source => String(unified().use(remarkParse).use(remarkGfm).use(remarkMath).use(remarkDisplayMath)
  .use(remarkRehype).use(rehypeKatex).use(rehypeStringify).processSync(source));
const standalone = parser.parse(note).children.filter(node => node.type === 'paragraph'
  && node.children.length === 1 && node.children[0].type === 'inlineMath');
const optimization = standalone.find(node => node.children[0].value.startsWith('\\min_')).children[0].value;
const granularity = standalone.find(node => node.children[0].value.startsWith('g^*')).children[0].value;

test('the KaTeX stylesheet package matches the renderer version', () => {
  const require = createRequire(import.meta.url);
  const rendererRequire = createRequire(require.resolve('rehype-katex'));
  assert.equal(require('katex').version, rendererRequire('katex').version);
  const html = render('$T_{max}$');
  const css = fs.readFileSync(require.resolve('katex/dist/katex.min.css'), 'utf8');
  assert(html.includes('katex-sizing reset-size6 size3'));
  assert(css.includes('.katex-sizing.reset-size6.size3{font-size:.7em}'));
});

test('standalone single-dollar optimization renders as three display rows', () => {
  const source = `$${optimization}$`;
  const tree = normalize(source);
  assert.equal(tree.children[0].type, 'math');
  const html = render(source);
  assert(html.includes('katex-display'));
  assert.equal((html.match(/<mtr>/g) ?? []).length, 3);
  assert(html.includes('<munder>'), 'min/max limits should use display layout');
  assert(!html.includes('katex-error'));
});

test('standalone fractions and subscripts retain their exact TeX source', () => {
  const source = `$${granularity}$`;
  assert.equal(normalize(source).children[0].value, granularity);
  const html = render(source);
  assert(html.includes('katex-display'));
  assert(html.includes('<mfrac>'));
  assert(html.includes('<msub>'));
  assert(html.includes('T_{max}'));
  assert(html.includes('L_{min}'));
  assert(!html.includes('katex-error'));
});

test('math inside sentences stays inline', () => {
  const source = '其中，$T_k$ 是吞吐量，$L_k$ 是延迟。';
  assert.deepEqual(normalize(source), parser.parse(source));
  assert(!render(source).includes('katex-display'));
});

test('existing aligned and matrix environments remain intact', () => {
  for (const value of [String.raw`\begin{aligned}a &= b \\ c &= d\end{aligned}`,
    String.raw`\begin{bmatrix}1 & 2 \\ 3 & 4\end{bmatrix}`,
    String.raw`\begin{cases}x & x > 0 \\ -x & x \le 0\end{cases}`]) {
    for (const source of [`$$\n${value}\n$$`, `$${value}$`]) {
      assert.equal(normalize(source).children[0].value, value);
      assert(!render(source).includes('katex-error'));
    }
  }
});

test('bare display row breaks work and normalization is idempotent', () => {
  const source = `$$\n${optimization}\n$$`;
  const once = normalize(source);
  const twice = remarkDisplayMath()(structuredClone(once));
  assert.deepEqual(twice, once);
  assert.equal((render(source).match(/<mtr>/g) ?? []).length, 3);
});

test('code, escaped dollars, headings and table inline math are untouched', () => {
  for (const source of ['`$x$`', '```js\nconst price = "$5";\n```', String.raw`价格为 \$5。`,
    '# $x$', '| 变量 | 数值 |\n| --- | --- |\n| $x$ | 1 |']) {
    assert.deepEqual(normalize(source), parser.parse(source));
  }
});

test('GFM table math stays inline and whitespace-only siblings allow display math', () => {
  const table = '| 变量 | 数值 |\n| --- | --- |\n| $x$ | 1 |';
  assert.equal(parser.parse(table).children[0].type, 'table');
  assert(!render(table).includes('katex-display'));
  const tree = parser.parse('$x$');
  tree.children[0].children.unshift({ type: 'text', value: '  ' });
  tree.children[0].children.push({ type: 'text', value: '\n' });
  assert.equal(remarkDisplayMath()(tree).children[0].type, 'math');
});

test('all standalone FlexPipe formulas become displays without math errors', () => {
  assert.equal(standalone.length, 6);
  for (const paragraph of standalone) {
    const html = render(`$${paragraph.children[0].value}$`);
    assert(html.includes('katex-display'));
    assert(!html.includes('katex-error'));
  }
});
