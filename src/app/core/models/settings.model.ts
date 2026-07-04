export interface Settings {
  theme: 'dark' | 'light';
  language: 'ar';
  defaultUrgeLevel: number | null;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  language: 'ar',
  defaultUrgeLevel: null,
};
