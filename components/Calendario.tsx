// components/Calendario.tsx

import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface Pet {
  id: string;
  nome: string;
  cor: string;
}

interface Evento {
  id: string;
  petId: string;
  data: string;
}

interface Props {
  pets: Pet[];
  eventos: Evento[];
  onDayPress?: (date: string) => void;
}

type MarkedDates = {
  [key: string]: {
    selected?: boolean;
    selectedColor?: string;
    dots?: Array<{
      key: string;
      color: string;
    }>;
  };
};

export function Calendario({ pets, eventos, onDayPress }: Props) {
  const { colors, isDark } = useTheme();
  const { t, language } = useLanguage();
  const [marcacoes, setMarcacoes] = useState<MarkedDates>({});
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [calendarKey, setCalendarKey] = useState(0);

  // Configurar localização do calendário
  useEffect(() => {
    const calendarLocales = {
      pt: {
        monthNames: [
          t('components.calendar.january'),
          t('components.calendar.february'),
          t('components.calendar.march'),
          t('components.calendar.april'),
          t('components.calendar.may'),
          t('components.calendar.june'),
          t('components.calendar.july'),
          t('components.calendar.august'),
          t('components.calendar.september'),
          t('components.calendar.october'),
          t('components.calendar.november'),
          t('components.calendar.december'),
        ],
        monthNamesShort: [
          'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
          'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ],
        dayNames: [
          'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
        ],
        dayNamesShort: [
          t('components.calendar.sunday'),
          t('components.calendar.monday'),
          t('components.calendar.tuesday'),
          t('components.calendar.wednesday'),
          t('components.calendar.thursday'),
          t('components.calendar.friday'),
          t('components.calendar.saturday'),
        ],
        today: t('components.calendar.today')
      },
      en: {
        monthNames: [
          t('components.calendar.january'),
          t('components.calendar.february'),
          t('components.calendar.march'),
          t('components.calendar.april'),
          t('components.calendar.may'),
          t('components.calendar.june'),
          t('components.calendar.july'),
          t('components.calendar.august'),
          t('components.calendar.september'),
          t('components.calendar.october'),
          t('components.calendar.november'),
          t('components.calendar.december'),
        ],
        monthNamesShort: [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ],
        dayNames: [
          'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ],
        dayNamesShort: [
          t('components.calendar.sunday'),
          t('components.calendar.monday'),
          t('components.calendar.tuesday'),
          t('components.calendar.wednesday'),
          t('components.calendar.thursday'),
          t('components.calendar.friday'),
          t('components.calendar.saturday'),
        ],
        today: t('components.calendar.today')
      },
      es: {
        monthNames: [
          t('components.calendar.january'),
          t('components.calendar.february'),
          t('components.calendar.march'),
          t('components.calendar.april'),
          t('components.calendar.may'),
          t('components.calendar.june'),
          t('components.calendar.july'),
          t('components.calendar.august'),
          t('components.calendar.september'),
          t('components.calendar.october'),
          t('components.calendar.november'),
          t('components.calendar.december'),
        ],
        monthNamesShort: [
          'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
          'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ],
        dayNames: [
          'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
        ],
        dayNamesShort: [
          t('components.calendar.sunday'),
          t('components.calendar.monday'),
          t('components.calendar.tuesday'),
          t('components.calendar.wednesday'),
          t('components.calendar.thursday'),
          t('components.calendar.friday'),
          t('components.calendar.saturday'),
        ],
        today: t('components.calendar.today')
      }
    };

    // Configurar locale
    LocaleConfig.locales[language] = calendarLocales[language];
    LocaleConfig.defaultLocale = language;

    // Forçar re-render do calendário quando idioma ou tema mudam
    setCalendarKey(prev => prev + 1);

  }, [language, t, isDark]); // ← Dependências incluem idioma e tema

  useEffect(() => {
    const marks: MarkedDates = {};

    const eventosPorData: { [date: string]: string[] } = {};

    eventos.forEach(ev => {
      if (!eventosPorData[ev.data]) {
        eventosPorData[ev.data] = [];
      }
      eventosPorData[ev.data].push(ev.petId);
    });

    for (const data in eventosPorData) {
      const petColors = eventosPorData[data]
        .map(petId => pets.find(p => p.id === petId)?.cor)
        .filter(Boolean) as string[];

      if (!petColors.length) continue;

      marks[data] = {
        dots: petColors.map((cor, index) => ({ 
          key: `${cor}-${index}`,
          color: cor 
        })),
        selected: diaSelecionado === data,
        selectedColor: diaSelecionado === data ? colors.primary : undefined,
      };
    }

    if (diaSelecionado && !marks[diaSelecionado]) {
      marks[diaSelecionado] = { 
        selected: true, 
        selectedColor: colors.primary
      };
    }

    setMarcacoes(marks);
  }, [eventos, pets, diaSelecionado, colors.primary, isDark, language]); // ← Dependências incluem idioma

  function handleDayPress(day: DateData) {
    setDiaSelecionado(day.dateString);
    if (onDayPress) onDayPress(day.dateString);
  }

  return (
    <View style={styles.container}>
      <Calendar
        key={`calendar-${language}-${isDark ? 'dark' : 'light'}-${calendarKey}`} // ← Key dinâmica com idioma, tema e contador
        onDayPress={handleDayPress}
        markingType={'multi-dot'}
        markedDates={marcacoes}
        theme={{
          // Cores principais
          todayTextColor: colors.calendarTodayText,
          arrowColor: colors.primary,
          monthTextColor: colors.calendarHeaderText,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: '#ffffff',
          
          // Fundo do calendário
          backgroundColor: colors.calendarBackground,
          calendarBackground: colors.calendarBackground,
          
          // Texto dos dias
          dayTextColor: colors.calendarText,
          textDisabledColor: colors.calendarDisabledText,
          textSectionTitleColor: colors.calendarWeekText || colors.text,
          
          // Dots (pontos dos eventos)
          dotColor: colors.primary,
          selectedDotColor: '#ffffff',
          
          // Fontes
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontWeight: '400',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '500',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
          
          // Cor dos dias inativos (mês anterior/próximo)
          textInactiveColor: colors.calendarDisabledText,
          
          // Cores de separadores
          indicatorColor: colors.primary,
          
          // Propriedades extras para forçar cores corretas
          agendaDayTextColor: colors.calendarText,
          agendaDayNumColor: colors.calendarText,
          agendaTodayColor: colors.calendarTodayText,
        }}
        enableSwipeMonths={true}
        hideExtraDays={false}
        firstDay={0}
        showWeekNumbers={false}
        style={{
          backgroundColor: colors.calendarBackground,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
});