import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setPrimaryColor: (color: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      primaryColor: '#1890ff',
      setTheme: (theme) => set({ theme }),
      setPrimaryColor: (primaryColor) => set({ primaryColor }),
    }),
    {
      name: 'theme-storage',
    }
  )
);

export const PRESET_COLORS = [
  '#1890ff',
  '#52c41a',
  '#fa8c16',
  '#f5222d',
  '#722ed1',
  '#13c2c2',
  '#eb2f96',
  '#faad14',
];

export const THEME_CONFIG = {
  light: {
    algorithm: 'light',
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 6,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    },
  },
  dark: {
    algorithm: 'dark',
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 6,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    },
  },
};