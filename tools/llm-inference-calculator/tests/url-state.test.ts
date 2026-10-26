import { afterEach, expect, it, vi } from 'vitest';

vi.mock('react', () => ({
  useState: (initial: unknown) => [typeof initial === 'function' ? initial() : initial, vi.fn()],
  useEffect: (effect: () => void) => effect(),
}));

const pathname = '/tools/llm-inference-calculator/';
const mockLocation = (search: string) => {
  const replaceState = vi.fn();
  vi.stubGlobal('window', { location: { pathname, search }, history: { replaceState } });
  return replaceState;
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

it('restores shared parameters and keeps the tools subpath when syncing state', async () => {
  const replaceState = mockLocation('?model=llama3_1_70b&gpu=h100_sxm&n=4&b=8&lang=zh');
  const { useUrlState } = await import('../src/ui/lib/useUrlParams');
  const [state] = useUrlState();
  expect(state).toMatchObject({ modelId: 'llama3_1_70b', gpuId: 'h100_sxm', numGpus: 4, batchSize: 8 });
  const url = new URL(replaceState.mock.calls[0]![2], 'https://boyjiang.com');
  expect(url.pathname).toBe(pathname);
  expect(url.searchParams.get('b')).toBe('8');
  expect(url.searchParams.get('lang')).toBe('zh');
});

it('language switching preserves calculator configuration and current subpath', async () => {
  const replaceState = mockLocation('?model=llama3_1_70b&b=8');
  const { writeLocaleToUrl } = await import('../src/ui/lib/useUrlParams');
  writeLocaleToUrl('zh');
  const url = new URL(replaceState.mock.calls[0]![2], 'https://boyjiang2.github.io');
  expect(url.pathname).toBe(pathname);
  expect(url.searchParams.get('model')).toBe('llama3_1_70b');
  expect(url.searchParams.get('b')).toBe('8');
  expect(url.searchParams.get('lang')).toBe('zh');
});

it('default state stays at the tools path without a query string', async () => {
  const replaceState = mockLocation('');
  const { useUrlState } = await import('../src/ui/lib/useUrlParams');
  useUrlState();
  expect(replaceState).toHaveBeenCalledWith(null, '', pathname);
});
