interface Theme {
  value: string;
  label: string;
  themeColor: string;
  scheme: 'light' | 'dark';
}

export const themes = [
  { value: 'pure-white', label: 'Pure White', themeColor: '#ffffff', scheme: 'light' },
  { value: 'midnight-gold', label: 'Midnight Gold', themeColor: '#f4f1ea', scheme: 'light' },
  { value: 'professional-dark', label: 'Professional Dark', themeColor: '#18191c', scheme: 'dark' },
  { value: 'pure-black', label: 'Pure Black', themeColor: '#000000', scheme: 'dark' },
] satisfies Theme[];

export const DEFAULT_THEME_ID = 'pure-white';
export const THEME_STORAGE_KEY = 'boy-jiang-theme-v2';
