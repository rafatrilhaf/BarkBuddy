// contexts/ThemeContext.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import theme, { rawColors, rawFontSizes } from 'constants/theme';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSizeLevel = 'small' | 'medium' | 'large';

export interface ThemeContextType {
  currentTheme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  fontSize: FontSizeLevel;
  setFontSize: (size: FontSizeLevel) => Promise<void>;
  colors: typeof rawColors.light;
  fontSizes: typeof rawFontSizes.medium;
  isDark: boolean;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [fontSize, setFontSizeState] = useState<FontSizeLevel>('medium');
  const [systemTheme, setSystemTheme] = useState<ColorSchemeName>('light');

  // Carregar configurações salvas
  const loadSettings = useCallback(async () => {
    try {
      const [savedTheme, savedFontSize] = await Promise.all([
        AsyncStorage.getItem('themeMode'),
        AsyncStorage.getItem('fontSize'),
      ]);

      if (
        savedTheme &&
        ['light', 'dark', 'system'].includes(savedTheme)
      ) {
        setThemeModeState(savedTheme as ThemeMode);
      }

      if (
        savedFontSize &&
        ['small', 'medium', 'large'].includes(savedFontSize)
      ) {
        setFontSizeState(savedFontSize as FontSizeLevel);
      }

      const currentSystemTheme = Appearance.getColorScheme();
      setSystemTheme(currentSystemTheme);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme);
    });
    return () => subscription.remove();
  }, [loadSettings]);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Erro ao salvar modo do tema:', error);
    }
  }, []);

  const setFontSize = useCallback(async (size: FontSizeLevel) => {
    try {
      await AsyncStorage.setItem('fontSize', size);
      setFontSizeState(size);
    } catch (error) {
      console.error('Erro ao salvar tamanho da fonte:', error);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const nextTheme: ThemeMode =
      themeMode === 'light'
        ? 'dark'
        : themeMode === 'dark'
        ? 'system'
        : 'light';
    await setThemeMode(nextTheme);
  }, [themeMode, setThemeMode]);

  const getCurrentTheme = (): 'light' | 'dark' => {
    if (themeMode === 'system') {
      return systemTheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode as 'light' | 'dark';
  };

  const currentTheme = getCurrentTheme();
  const isDark = currentTheme === 'dark';
  const themeColors = rawColors[currentTheme];
  const themeFontSizes = rawFontSizes[fontSize];

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeMode,
        setThemeMode,
        fontSize,
        setFontSize,
        colors: themeColors,
        fontSizes: themeFontSizes,
        isDark,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

export default theme;
