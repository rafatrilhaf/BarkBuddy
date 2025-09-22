// contexts/ThemeContext.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSizeLevel = 'small' | 'medium' | 'large';

const fontSizes = {
  small: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
  },
  medium: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
  large: {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 22,
    xxl: 26,
  },
};

const colors = {
  // Cores base do projeto
  green: '#085f37',
  greenDark: '#1b6d49',
  greenLight: '#dfeee6',
  white: '#ffffff',
  offWhite: '#ececec',
  accent: '#ff6a00',
  loginButton: '#d3e3d9',

  // Cores para modo claro
  light: {
    primary: '#085f37',
    primaryLight: '#1b6d49',
    primaryDark: '#064429',
    accent: '#ff6a00',
    background: '#ffffff',
    surface: '#f8f9fa',
    card: '#ffffff',
    text: '#1a1a1a',
    textSecondary: '#666666',
    textTertiary: '#999999',
    border: '#e0e0e0',
    success: '#085f37',
    warning: '#ff6a00',
    error: '#dc3545',
    info: '#17a2b8',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    // Adicionar propriedades que estão sendo usadas
    green: '#085f37',
    greenDark: '#1b6d49',
    greenLight: '#dfeee6',
    // Cores específicas para calendário
    calendarBackground: '#ffffff',
    calendarText: '#1a1a1a',
    calendarHeaderText: '#1a1a1a',
    calendarDisabledText: '#cccccc',
    calendarTodayText: '#085f37',
  },

  // Cores para modo escuro
  dark: {
    primary: '#2e7d51',       // verde mais claro
    primaryDark: '#167647',   // verde mais claro escuro
    primaryLight: '#3ca764',  // ajustado para acompanhar
    accent: '#ff8533',
    background: '#121212',    // Mudei de #000000ff para um preto mais suave
    surface: '#1e1e1e',
    card: '#2a2a2a',
    text: '#ffffff',
    textSecondary: '#cccccc',
    textTertiary: '#888888',
    border: '#404040',
    success: '#2d8659',
    warning: '#ff8533',
    error: '#ff5449',
    info: '#4a90e2',
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    // Adicionar propriedades que estão sendo usadas
    green: '#2e7d51',
    greenDark: '#167647', 
    greenLight: '#2d4a35',
    // Cores específicas para calendário no modo escuro
    calendarBackground: '#1e1e1e',
    calendarText: '#ffffff',
    calendarHeaderText: '#ffffff',
    calendarDisabledText: '#666666',
    calendarTodayText: '#2e7d51',
  },
};

const theme = {
  colors,
  fontSizes,
};

export interface ThemeContextType {
  currentTheme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  fontSize: FontSizeLevel;
  setFontSize: (size: FontSizeLevel) => Promise<void>;
  colors: typeof colors.light;
  fontSizes: typeof fontSizes.medium;
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

      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeModeState(savedTheme as ThemeMode);
      }

      if (savedFontSize && ['small', 'medium', 'large'].includes(savedFontSize)) {
        setFontSizeState(savedFontSize as FontSizeLevel);
      }

      // Configurar listener para mudanças do sistema
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

  // Salvar modo do tema
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Erro ao salvar modo do tema:', error);
    }
  }, []);

  // Salvar tamanho da fonte
  const setFontSize = useCallback(async (size: FontSizeLevel) => {
    try {
      await AsyncStorage.setItem('fontSize', size);
      setFontSizeState(size);
    } catch (error) {
      console.error('Erro ao salvar tamanho da fonte:', error);
    }
  }, []);

  // Alternar tema
  const toggleTheme = useCallback(async () => {
    const nextTheme: ThemeMode = 
      themeMode === 'light' ? 'dark' : 
      themeMode === 'dark' ? 'system' : 'light';
    await setThemeMode(nextTheme);
  }, [themeMode, setThemeMode]);

  // Determinar tema atual
  const getCurrentTheme = (): 'light' | 'dark' => {
    if (themeMode === 'system') {
      return systemTheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode as 'light' | 'dark';
  };

  const currentTheme = getCurrentTheme();
  const isDark = currentTheme === 'dark';
  const themeColors = colors[currentTheme];
  const themeFontSizes = fontSizes[fontSize];

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
