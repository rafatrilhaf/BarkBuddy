import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, DateData, MarkedDates } from 'react-native-calendars';

interface Pet {
  id: string;
  nome: string;
  cor: string; // Hex ou nome de cor para marcação
}

interface Evento {
  id: string;
  petId: string;
  data: string; // "YYYY-MM-DD"
}

interface Props {
  pets: Pet[];
  eventos: Evento[];
  onDayPress?: (date: string) => void;
}

export function Calendario({ pets, eventos, onDayPress }: Props) {
  const [marcacoes, setMarcacoes] = useState<MarkedDates>({});
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);

  useEffect(() => {
    const marks: MarkedDates = {};

    // Agrupar eventos por data e montar as cores dos pets
    const eventosPorData: { [date: string]: string[] } = {};

    eventos.forEach(ev => {
      if (!eventosPorData[ev.data]) {
        eventosPorData[ev.data] = [];
      }
      eventosPorData[ev.data].push(ev.petId);
    });

    for (const data in eventosPorData) {
      // Criar array de marcações de cores para aquele dia
      const colors = eventosPorData[data]
        .map(petId => pets.find(p => p.id === petId)?.cor)
        .filter(Boolean) as string[];

      if (!colors.length) continue;

      // Usar múltiplas marcações coloridas (dots)
      marks[data] = {
        dots: colors.map(cor => ({ key: cor, color: cor })),
        selected: diaSelecionado === data,
        selectedColor: diaSelecionado === data ? '#999' : undefined,
      };
    }

    // Se há dia selecionado e não tem marcação, marcar só a seleção
    if (diaSelecionado && !marks[diaSelecionado]) {
      marks[diaSelecionado] = { selected: true, selectedColor: '#999' };
    }

    setMarcacoes(marks);
  }, [eventos, pets, diaSelecionado]);

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
          todayTextColor: '#00adf5',
          arrowColor: '#00adf5',
          monthTextColor: '#333',
        }}
        enableSwipeMonths={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
});
