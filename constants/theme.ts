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
  },

  dark: {
  primary: '#2e7d51',       // verde mais claro
  primaryDark: '#167647',   // verde mais claro escuro
  primaryLight: '#3ca764',  // ajustado para acompanhar
  accent: '#ff8533',
  background: '#121212',
  surface: '#1e1e1e',
  card: '#2a2a2a',
  text: '#ffffff',
  textSecondary: '#cccccc',
  textTertiary: '#888888',
  border: '#404040',
  success: '#2e7d51',
  warning: '#ff8533',
  error: '#ff5449',
  info: '#4a90e',
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.3)',
}
  }

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
    xxl: 22,
  },
  large: {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 22,
    xxl: 24,
  },
};

const theme = {
  ...colors, // Manter as cores originais para compatibilidade
  colors,
  fontSizes,
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
