// components/Calendario.tsx

import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
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
  const [marcacoes, setMarcacoes] = useState<MarkedDates>({});
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);

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
  }, [eventos, pets, diaSelecionado, colors.primary]);

  function handleDayPress(day: DateData) {
    setDiaSelecionado(day.dateString);
    if (onDayPress) onDayPress(day.dateString);
  }

  return (
    <View style={styles.container}>
      <Calendar
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
          textSectionTitleColor: colors.textSecondary,
          
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
