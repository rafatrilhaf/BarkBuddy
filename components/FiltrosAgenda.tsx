import React, { useEffect, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Pet {
  id: string;
  nome: string;
  cor: string;
}

interface Props {
  visible: boolean;
  pets: Pet[];
  categorias: string[]; // Ex: ['consulta', 'medicacao', 'banho', 'outro']
  filtrosAtuais: {
    petsSelecionados: string[]; // id dos pets
    categoriasSelecionadas: string[];
  };
  onClose: () => void;
  onAplicarFiltros: (petsSelecionados: string[], categoriasSelecionadas: string[]) => void;
}

export function FiltrosAgenda({
  visible,
  pets,
  categorias,
  filtrosAtuais,
  onClose,
  onAplicarFiltros,
}: Props) {
  const [petsSelecionados, setPetsSelecionados] = useState<string[]>([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>([]);

  useEffect(() => {
    setPetsSelecionados(filtrosAtuais.petsSelecionados);
    setCategoriasSelecionadas(filtrosAtuais.categoriasSelecionadas);
  }, [filtrosAtuais, visible]);

  function toggleSelecao(array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>, valor: string) {
    if (array.includes(valor)) {
      setArray(array.filter(v => v !== valor));
    } else {
      setArray([...array, valor]);
    }
  }

  function aplicar() {
    onAplicarFiltros(petsSelecionados, categoriasSelecionadas);
    onClose();
  }

  function limpar() {
    setPetsSelecionados([]);
    setCategoriasSelecionadas([]);
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.titulo}>Filtros da Agenda</Text>

          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Pets</Text>
            <View style={styles.opcoesContainer}>
              {pets.map(pet => {
                const selecionado = petsSelecionados.includes(pet.id);
                return (
                  <TouchableOpacity
                    key={pet.id}
                    style={[styles.opcao, selecionado && styles.opcaoSelecionada, { borderColor: pet.cor }]}
                    onPress={() => toggleSelecao(petsSelecionados, setPetsSelecionados, pet.id)}
                  >
                    <Text style={selecionado ? styles.textoSelecionado : styles.textoOpcao}>
                      {pet.nome}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Categorias</Text>
            <View style={styles.opcoesContainer}>
              {categorias.map(cat => {
                const selecionado = categoriasSelecionadas.includes(cat);
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.opcao, selecionado && styles.opcaoSelecionada]}
                    onPress={() => toggleSelecao(categoriasSelecionadas, setCategoriasSelecionadas, cat)}
                  >
                    <Text style={selecionado ? styles.textoSelecionado : styles.textoOpcao}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.botoes}>
            <TouchableOpacity onPress={limpar} style={[styles.botao, styles.botaoLimpar]}>
              <Text style={styles.textoBotao}>Limpar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={aplicar} style={[styles.botao, styles.botaoAplicar]}>
              <Text style={[styles.textoBotao, { color: '#fff' }]}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '80%',
    padding: 20,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  scroll: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  opcoesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  opcao: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  opcaoSelecionada: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  textoOpcao: {
    color: '#333',
  },
  textoSelecionado: {
    color: '#fff',
  },
  botoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botao: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  botaoLimpar: {
    backgroundColor: '#ccc',
  },
  botaoAplicar: {
    backgroundColor: '#007bff',
  },
  textoBotao: {
    fontWeight: '600',
    fontSize: 16,
  },
});
