import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Nota {
  id: string;
  titulo: string;
  texto: string;
  data: string; // no formato "YYYY-MM-DD"
}

interface Props {
  notas: Nota[];
  onPressNota: (nota: Nota) => void;
}

export function ListaNotas({ notas, onPressNota }: Props) {
  if (notas.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.semNotas}>Nenhuma nota para esta data.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notas}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onPressNota(item)}>
            <Text style={styles.titulo}>{item.titulo}</Text>
            <Text numberOfLines={3} style={styles.resumo}>
              {item.texto}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  listContent: {
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 220,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  titulo: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  resumo: {
    fontSize: 14,
    color: '#555',
  },
  semNotas: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
  },
});
