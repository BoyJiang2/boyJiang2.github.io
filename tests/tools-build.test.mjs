import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const dist = new URL('../dist/', import.meta.url);
const read = file => fs.readFileSync(new URL(file, dist), 'utf8');
const toolPath = '/tools/llm-inference-calculator/';

test('tools navigation and directory use the existing site layout', () => {
  for (const file of ['index.html', 'blogs/index.html', 'notes/index.html', 'tools/index.html']) {
    const html = read(file);
    assert(html.includes('href="/tools/"'), `${file} must link to tools`);
    assert(html.includes('Boy Jiang'));
  }
  const directory = read('tools/index.html');
  assert(directory.includes(`href="${toolPath}"`));
  assert(directory.includes('LLM 推理计算器'));
});

test('calculator has a standalone entry and deployable subpath assets', () => {
  const html = read(`${toolPath.slice(1)}index.html`);
  assert(html.includes('id="root"'));
  const assets = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map(match => match[1]);
  assert(assets.some(asset => asset.endsWith('.js')));
  assert(assets.some(asset => asset.endsWith('.css')));
  for (const asset of assets) {
    assert(asset.startsWith(`${toolPath}assets/`), `unexpected asset path: ${asset}`);
    assert(fs.existsSync(new URL(asset.slice(1), dist)), `missing asset: ${asset}`);
  }
  assert(!html.includes('<iframe'));
});

test('calculator keeps return navigation without GitHub promotion or Vercel tracking', () => {
  const assets = new URL(`${toolPath.slice(1)}assets/`, dist);
  const scripts = fs.readdirSync(assets).filter(file => path.extname(file) === '.js')
    .map(file => fs.readFileSync(new URL(file, assets), 'utf8')).join('\n');
  assert(scripts.includes('/tools/'));
  assert(scripts.includes('tool-breadcrumb'));
  assert(scripts.includes('工具导航'));
  assert(!scripts.includes('github.com/pochenai/llm-inference-calculator'));
  assert(!scripts.includes('Please⭐'));
  assert(!scripts.includes('please star'));
  const notice = fs.readFileSync(new URL('../tools/llm-inference-calculator/NOTICE.md', import.meta.url), 'utf8');
  assert(notice.includes('https://github.com/pochenai/llm-inference-calculator'));
  assert(!scripts.includes('/_vercel/'));
  assert(!scripts.includes('va.vercel-scripts.com'));
});

test('Cloudflare has an explicit assets-only configuration for the combined build', () => {
  const config = JSON.parse(fs.readFileSync(new URL('../wrangler.json', import.meta.url), 'utf8'));
  assert.equal(config.name, 'boy-website');
  assert.equal(config.assets.directory, './dist');
  assert(!config.assets.binding, 'assets-only Workers cannot declare a script binding');
  assert(!config.main);
  assert(!config.routes, 'existing dashboard domain configuration must stay unmanaged');
  assert(config.compatibility_date);
});

test('site search indexes calculator metadata without its internal data catalog', () => {
  const html = read('search/index.html');
  assert(html.includes(`href="${toolPath}"`));
  assert(html.includes('LLM 推理计算器'));
  assert(!html.includes('llama3_1_8b'));
  assert(!html.includes('h100_sxm'));
});
