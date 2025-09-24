// constants/theme.ts

export const rawColors = {
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
    calendarBackground: '#ffffff',
    calendarText: '#1a1a1a',
    calendarHeaderText: '#085f37',
    calendarDisabledText: '#cccccc',
    calendarTodayText: '#085f37',
    calendarWeekText: '#333333',
    tabBarBackground: '#085f37',
    tabBarActive: '#ffffff',
    tabBarInactive: '#ffffff80',
    white: '#ffffffff'

  },

  // Cores para modo escuro
  dark: {
    primary: '#23a367ff',
    primaryLight: '#068b51ff',
    primaryDark: '#064429',
    accent: '#ff8533',
    background: '#121212',
    surface: '#1e1e1e',
    card: '#2a2a2a',
    text: '#ffffff',
    textSecondary: '#cccccc',
    textTertiary: '#888888',
    border: '#404040',
    success: '#085f37',
    warning: '#ff8533',
    error: '#ff5449',
    info: '#4a90e2',
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    calendarBackground: '#1e1e1e',
    calendarText: '#ffffff',
    calendarHeaderText: '#085f37',
    calendarDisabledText: '#666666',
    calendarTodayText: '#085f37',
    calendarWeekText: '#e0e0e0',
    tabBarBackground: '#0a2818',
    tabBarActive: '#4ade80',
    tabBarInactive: '#9ca3af',
    white: '#ffffffff'
  },
};

export const rawFontSizes = {
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

const theme = {
  colors: rawColors,
  fontSizes: rawFontSizes,
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};

export default theme;
