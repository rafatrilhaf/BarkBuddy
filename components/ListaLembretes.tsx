import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Pet {
  id: string;
  nome: string;
  cor: string;
}

interface Lembrete {
  id: string;
  petId: string;
  titulo: string;
  descricao?: string;
  categoria: string;
  dataHora: Date;
  concluido: boolean;
}

interface Props {
  pets: Pet[];
  lembretes: Lembrete[];
  onEditar: (lembrete: Lembrete) => void;
  onExcluir: (lembreteId: string) => void;
  onToggleConcluido: (lembreteId: string, concluido: boolean) => void;
}

export function ListaLembretes({ pets, lembretes, onEditar, onExcluir, onToggleConcluido }: Props) {
  // Agrupa lembretes por petId    
  const lembretesAgrupados = pets.map(pet => ({
    pet,
    lembretes: lembretes.filter(l => l.petId === pet.id),
  })).filter(grupo => grupo.lembretes.length > 0);

  function confirmarExclusao(lembreteId: string) {
    Alert.alert(
      'Excluir lembrete',
      'Tem certeza que deseja excluir este lembrete?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => onExcluir(lembreteId),
        },
      ],
    );
  }

  return (
    <FlatList
      data={lembretesAgrupados}
      keyExtractor={grupo => grupo.pet.id}
      renderItem={({ item }) => (
        <View style={styles.grupo}>
          <Text style={[styles.tituloPet, { color: item.pet.cor }]}>{item.pet.nome}</Text>
          {item.lembretes.map(lembrete => (
            <View key={lembrete.id} style={styles.lembreteContainer}>
              <TouchableOpacity
                onPress={() => onToggleConcluido(lembrete.id, !lembrete.concluido)}
                style={[styles.checkbox, lembrete.concluido && styles.checkboxChecked]}
              >
                {lembrete.concluido && <Text style={styles.checkboxMark}>✓</Text>}
              </TouchableOpacity>
              <View style={styles.textos}>
                <Text style={[styles.tituloLembrete, lembrete.concluido && styles.textoConcluido]}>
                  {lembrete.titulo}
                </Text>
                <Text style={styles.categoria}>{lembrete.categoria}</Text>
                <Text style={styles.horario}>
                  {lembrete.dataHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <TouchableOpacity onPress={() => onEditar(lembrete)} style={styles.botaoEditar}>
                <Text style={styles.textoBotao}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmarExclusao(lembrete.id)} style={styles.botaoExcluir}>
                <Text style={[styles.textoBotao, { color: 'red' }]}>Excluir</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      ListEmptyComponent={<Text style={styles.semLembretes}>Nenhum lembrete para esta data.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  grupo: {
    marginBottom: 16,
  },
  tituloPet: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lembreteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#f2f2f2',
    borderRadius: 6,
    marginBottom: 6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  checkboxMark: {
    color: 'white',
    fontWeight: 'bold',
  },
  textos: {
    flex: 1,
  },
  tituloLembrete: {
    fontSize: 16,
    fontWeight: '600',
  },
  textoConcluido: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  categoria: {
    fontSize: 12,
    color: '#555',
  },
  horario: {
    fontSize: 12,
    color: '#555',
  },
  botaoEditar: {
    paddingHorizontal: 8,
  },
  botaoExcluir: {
    paddingHorizontal: 8,
  },
  textoBotao: {
    fontSize: 14,
    color: '#007bff',
  },
  semLembretes: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});
