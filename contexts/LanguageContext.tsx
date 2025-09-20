import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

const translations = {
  pt: {
    // Navegação
    'nav.dashboard': 'Dashboard',
    'nav.maps': 'Mapas',
    'nav.pets': 'Pets',
    'nav.blog': 'Blog',
    'nav.tutor': 'Tutor',
    'nav.settings': 'Configurações',

    // Geral
    'general.save': 'Salvar',
    'general.cancel': 'Cancelar',
    'general.loading': 'Carregando...',
    'general.error': 'Erro',
    'general.success': 'Sucesso',
    'general.edit': 'Editar',
    'general.confirm': 'Confirmar',

    // Tutor
    'tutor.name': 'Nome',
    'tutor.phone': 'Telefone', 
    'tutor.address': 'Endereço',
    'tutor.email': 'Email',

    // Configurações
    'settings.title': 'Configurações',
    'settings.appearance': 'Aparência',
    'settings.theme': 'Tema',
    'settings.language': 'Idioma',
    'settings.accessibility': 'Acessibilidade',
    'settings.fontSize': 'Tamanho da Fonte',
    'settings.account': 'Conta',
    'settings.support': 'Suporte',
    'settings.help': 'Ajuda',
    'settings.about': 'Sobre',
    
    // Temas
    'theme.light': 'Claro',
    'theme.dark': 'Escuro',
    'theme.system': 'Sistema',
    
    // Tamanhos de fonte
    'fontSize.small': 'Pequeno',
    'fontSize.medium': 'Médio',
    'fontSize.large': 'Grande',

    // Autenticação
    'auth.logout': 'Sair',
    'auth.logoutConfirm': 'Deseja realmente sair?',

    // Botões
    'button.ok': 'OK',
    'button.yes': 'Sim',
    'button.no': 'Não',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.maps': 'Maps',
    'nav.pets': 'Pets',
    'nav.blog': 'Blog',
    'nav.tutor': 'Tutor',
    'nav.settings': 'Settings',

    // General
    'general.save': 'Save',
    'general.cancel': 'Cancel',
    'general.loading': 'Loading...',
    'general.error': 'Error',
    'general.success': 'Success',
    'general.edit': 'Edit',
    'general.confirm': 'Confirm',

    // Tutor
    'tutor.name': 'Name',
    'tutor.phone': 'Phone',
    'tutor.address': 'Address',
    'tutor.email': 'Email',

    // Settings
    'settings.title': 'Settings',
    'settings.appearance': 'Appearance',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.accessibility': 'Accessibility',
    'settings.fontSize': 'Font Size',
    'settings.account': 'Account',
    'settings.support': 'Support',
    'settings.help': 'Help',
    'settings.about': 'About',
    
    // Themes
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
    
    // Font sizes
    'fontSize.small': 'Small',
    'fontSize.medium': 'Medium',
    'fontSize.large': 'Large',

    // Auth
    'auth.logout': 'Logout',
    'auth.logoutConfirm': 'Are you sure you want to logout?',

    // Buttons
    'button.ok': 'OK',
    'button.yes': 'Yes',
    'button.no': 'No',
  },
  es: {
    // Navegación
    'nav.dashboard': 'Panel',
    'nav.maps': 'Mapas',
    'nav.pets': 'Mascotas',
    'nav.blog': 'Blog',
    'nav.tutor': 'Tutor',
    'nav.settings': 'Configuración',

    // General
    'general.save': 'Guardar',
    'general.cancel': 'Cancelar',
    'general.loading': 'Cargando...',
    'general.error': 'Error',
    'general.success': 'Éxito',
    'general.edit': 'Editar',
    'general.confirm': 'Confirmar',

    // Tutor
    'tutor.name': 'Nombre',
    'tutor.phone': 'Teléfono',
    'tutor.address': 'Dirección', 
    'tutor.email': 'Email',

    // Configuración
    'settings.title': 'Configuración',
    'settings.appearance': 'Apariencia',
    'settings.theme': 'Tema',
    'settings.language': 'Idioma',
    'settings.accessibility': 'Accesibilidad',
    'settings.fontSize': 'Tamaño de Fuente',
    'settings.account': 'Cuenta',
    'settings.support': 'Soporte',
    'settings.help': 'Ayuda',
    'settings.about': 'Acerca de',
    
    // Temas
    'theme.light': 'Claro',
    'theme.dark': 'Oscuro',
    'theme.system': 'Sistema',
    
    // Tamaños de fuente
    'fontSize.small': 'Pequeño',
    'fontSize.medium': 'Mediano',
    'fontSize.large': 'Grande',

    // Autenticación
    'auth.logout': 'Cerrar Sesión',
    'auth.logoutConfirm': '¿Estás seguro de que deseas cerrar sesión?',

    // Botones
    'button.ok': 'OK',
    'button.yes': 'Sí',
    'button.no': 'No',
  },
};

type TranslationKey = keyof typeof translations.pt;
type Language = 'pt' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('pt');

  const loadLanguage = useCallback(async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage && ['pt', 'en', 'es'].includes(savedLanguage)) {
        setLanguageState(savedLanguage as Language);
      } else {
        // Detectar idioma do sistema
        const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'pt';
        const supportedLanguage: Language = ['pt', 'en', 'es'].includes(deviceLanguage) 
          ? (deviceLanguage as Language) 
          : 'pt';
        setLanguageState(supportedLanguage);
        await AsyncStorage.setItem('language', supportedLanguage);
      }
    } catch (error) {
      console.error('Erro ao carregar idioma:', error);
      setLanguageState('pt');
    }
  }, []);

  useEffect(() => {
    loadLanguage();
  }, [loadLanguage]);

  const setLanguage = useCallback(async (lang: Language) => {
    try {
      await AsyncStorage.setItem('language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Erro ao salvar idioma:', error);
    }
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    const languageTranslations = translations[language] || translations.pt;
    return languageTranslations[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage deve ser usado dentro de um LanguageProvider');
  }
  return context;
};
