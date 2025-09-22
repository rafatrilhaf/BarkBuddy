import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { NativeModules, Platform } from 'react-native';

const translations = {
  pt: {
    // Navegação
    'nav.dashboard': 'Dashboard',
    'nav.maps': 'Mapas',
    'nav.pets': 'Pets',
    'nav.blog': 'Blog',
    'nav.tutor': 'Tutor',
    'nav.settings': 'Configurações',
    'nav.agenda': 'Agenda',

    // Geral
    'general.save': 'Salvar',
    'general.cancel': 'Cancelar',
    'general.loading': 'Carregando...',
    'general.error': 'Erro',
    'general.success': 'Sucesso',
    'general.edit': 'Editar',
    'general.confirm': 'Confirmar',
    'general.delete': 'Excluir',
    'general.add': 'Adicionar',
    'general.filter': 'Filtro',
    'general.apply': 'Aplicar',
    'general.clear': 'Limpar',

    // Tutor
    'tutor.name': 'Nome',
    'tutor.phone': 'Telefone', 
    'tutor.address': 'Endereço',
    'tutor.email': 'Email',

    // Agenda
    'agenda.title': 'Agenda',
    'agenda.newReminder': 'Novo Lembrete',
    'agenda.editReminder': 'Editar Lembrete',
    'agenda.reminderTitle': 'Título',
    'agenda.reminderDescription': 'Descrição',
    'agenda.selectPet': 'Selecionar Pet',
    'agenda.selectCategory': 'Selecionar Categoria',
    'agenda.selectDate': 'Selecionar Data',
    'agenda.selectTime': 'Selecionar Hora',
    'agenda.notification': 'Notificação',
    'agenda.completed': 'Concluído',
    'agenda.pending': 'Pendente',
    'agenda.noReminders': 'Nenhum lembrete para esta data',
    'agenda.deleteConfirm': 'Deseja realmente excluir este lembrete?',
    'agenda.reminderSaved': 'Lembrete salvo com sucesso!',
    'agenda.reminderDeleted': 'Lembrete excluído!',
    'agenda.filters': 'Filtros da Agenda',
    'agenda.showCompleted': 'Mostrar Concluídos',
    'agenda.notesOfDay': 'Notas do dia',
    'agenda.noNotes': 'Nenhuma nota para esta data',

    // Categorias da Agenda
    'category.consulta': 'Consulta',
    'category.medicacao': 'Medicação',
    'category.banho': 'Banho',
    'category.exercicio': 'Exercício',
    'category.alimentacao': 'Alimentação',
    'category.outro': 'Outro',

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
    'nav.agenda': 'Schedule',

    // General
    'general.save': 'Save',
    'general.cancel': 'Cancel',
    'general.loading': 'Loading...',
    'general.error': 'Error',
    'general.success': 'Success',
    'general.edit': 'Edit',
    'general.confirm': 'Confirm',
    'general.delete': 'Delete',
    'general.add': 'Add',
    'general.filter': 'Filter',
    'general.apply': 'Apply',
    'general.clear': 'Clear',

    // Tutor
    'tutor.name': 'Name',
    'tutor.phone': 'Phone',
    'tutor.address': 'Address',
    'tutor.email': 'Email',

    // Schedule
    'agenda.title': 'Schedule',
    'agenda.newReminder': 'New Reminder',
    'agenda.editReminder': 'Edit Reminder',
    'agenda.reminderTitle': 'Title',
    'agenda.reminderDescription': 'Description',
    'agenda.selectPet': 'Select Pet',
    'agenda.selectCategory': 'Select Category',
    'agenda.selectDate': 'Select Date',
    'agenda.selectTime': 'Select Time',
    'agenda.notification': 'Notification',
    'agenda.completed': 'Completed',
    'agenda.pending': 'Pending',
    'agenda.noReminders': 'No reminders for this date',
    'agenda.deleteConfirm': 'Are you sure you want to delete this reminder?',
    'agenda.reminderSaved': 'Reminder saved successfully!',
    'agenda.reminderDeleted': 'Reminder deleted!',
    'agenda.filters': 'Schedule Filters',
    'agenda.showCompleted': 'Show Completed',
    'agenda.notesOfDay': 'Notes of the day',
    'agenda.noNotes': 'No notes for this date',

    // Categories
    'category.consulta': 'Appointment',
    'category.medicacao': 'Medication',
    'category.banho': 'Bath',
    'category.exercicio': 'Exercise',
    'category.alimentacao': 'Feeding',
    'category.outro': 'Other',

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
    'nav.agenda': 'Agenda',

    // General
    'general.save': 'Guardar',
    'general.cancel': 'Cancelar',
    'general.loading': 'Cargando...',
    'general.error': 'Error',
    'general.success': 'Éxito',
    'general.edit': 'Editar',
    'general.confirm': 'Confirmar',
    'general.delete': 'Eliminar',
    'general.add': 'Añadir',
    'general.filter': 'Filtro',
    'general.apply': 'Aplicar',
    'general.clear': 'Limpiar',

    // Tutor
    'tutor.name': 'Nombre',
    'tutor.phone': 'Teléfono',
    'tutor.address': 'Dirección', 
    'tutor.email': 'Email',

    // Agenda
    'agenda.title': 'Agenda',
    'agenda.newReminder': 'Nuevo Recordatorio',
    'agenda.editReminder': 'Editar Recordatorio',
    'agenda.reminderTitle': 'Título',
    'agenda.reminderDescription': 'Descripción',
    'agenda.selectPet': 'Seleccionar Mascota',
    'agenda.selectCategory': 'Seleccionar Categoría',
    'agenda.selectDate': 'Seleccionar Fecha',
    'agenda.selectTime': 'Seleccionar Hora',
    'agenda.notification': 'Notificación',
    'agenda.completed': 'Completado',
    'agenda.pending': 'Pendiente',
    'agenda.noReminders': 'No hay recordatorios para esta fecha',
    'agenda.deleteConfirm': '¿Estás seguro de que deseas eliminar este recordatorio?',
    'agenda.reminderSaved': '¡Recordatorio guardado exitosamente!',
    'agenda.reminderDeleted': '¡Recordatorio eliminado!',
    'agenda.filters': 'Filtros de Agenda',
    'agenda.showCompleted': 'Mostrar Completados',
    'agenda.notesOfDay': 'Notas del día',
    'agenda.noNotes': 'No hay notas para esta fecha',

    // Categorías
    'category.consulta': 'Consulta',
    'category.medicacao': 'Medicación',
    'category.banho': 'Baño',
    'category.exercicio': 'Ejercicio',
    'category.alimentacao': 'Alimentación',
    'category.outro': 'Otro',

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

// Função para detectar idioma do dispositivo sem expo-localization
const getDeviceLanguage = (): Language => {
  try {
    let deviceLanguage = 'pt';
    
    if (Platform.OS === 'ios') {
      deviceLanguage = NativeModules.SettingsManager?.settings?.AppleLocale ||
                      NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
                      'pt';
    } else if (Platform.OS === 'android') {
      deviceLanguage = NativeModules.I18nManager?.localeIdentifier || 'pt';
    }
    
    // Extrair apenas o código do idioma (pt-BR -> pt)
    const languageCode = deviceLanguage.split('-')[0].split('_')[0].toLowerCase();
    
    // Verificar se é um idioma suportado
    if (['pt', 'en', 'es'].includes(languageCode)) {
      return languageCode as Language;
    }
    
    return 'pt'; // Fallback para português
  } catch (error) {
    console.log('Erro ao detectar idioma do dispositivo:', error);
    return 'pt';
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('pt');

  const loadLanguage = useCallback(async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage && ['pt', 'en', 'es'].includes(savedLanguage)) {
        setLanguageState(savedLanguage as Language);
      } else {
        // Detectar idioma do sistema
        const deviceLanguage = getDeviceLanguage();
        setLanguageState(deviceLanguage);
        await AsyncStorage.setItem('language', deviceLanguage);
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
