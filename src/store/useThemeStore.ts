import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

type ThemeState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ggas-theme',
      version: 1,
      migrate: (persistedState) => ({
        theme:
          typeof persistedState === 'object' &&
          persistedState !== null &&
          'theme' in persistedState &&
          persistedState.theme === 'dark'
            ? 'dark'
            : 'light',
      }),
      storage: createJSONStorage(() => localStorage),
      partialize: ({ theme }) => ({ theme }),
    },
  ),
)
