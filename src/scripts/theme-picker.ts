import { DEFAULT_THEME_ID, THEME_STORAGE_KEY, themes } from '../config/themes';

const themePicker = document.querySelector<HTMLDetailsElement>('.theme-picker');
const themeButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-theme-value]')];
const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
const defaultTheme = themes.find((theme) => theme.value === DEFAULT_THEME_ID)!;

const syncSelection = (value: string) => {
  themeButtons.forEach((button) => button.classList.toggle('selected', button.dataset.themeValue === value));
};

const setTheme = (value = DEFAULT_THEME_ID) => {
  const theme = themes.find((theme) => theme.value === value) ?? defaultTheme;
  document.documentElement.dataset.theme = theme.value;
  document.documentElement.dataset.scheme = theme.scheme;
  themeColor?.setAttribute('content', theme.themeColor);
  syncSelection(theme.value);
  try { localStorage.setItem(THEME_STORAGE_KEY, theme.value); } catch {}
  document.dispatchEvent(new CustomEvent('boy-jiang:theme-change'));
};

syncSelection(document.documentElement.dataset.theme ?? DEFAULT_THEME_ID);
themeButtons.forEach((button) => button.addEventListener('click', () => {
  setTheme(button.dataset.themeValue);
  themePicker?.removeAttribute('open');
}));
document.addEventListener('click', (event) => {
  if (themePicker?.open && event.target instanceof Node && !themePicker.contains(event.target)) themePicker.removeAttribute('open');
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') themePicker?.removeAttribute('open');
});
