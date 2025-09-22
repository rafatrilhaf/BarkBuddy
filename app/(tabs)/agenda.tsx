// app/(tabs)/agenda.tsx

import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // ou outro ícone que você usar
import { Calendario } from '../../components/Calendario';
import { FiltrosAgenda } from '../../components/FiltrosAgenda';
import { ListaLembretes } from '../../components/ListaLembretes';
import { ListaNotas } from '../../components/ListaNotas';
import { ModalLembrete } from '../../components/ModalLembrete';
import { AgendaService, Lembrete } from '../../services/agenda';

// Supondo que você tenha estes dados do contexto, store ou API
import { useNotas } from '../../hooks/useNotas'; // Hook para pegar as notas
import { usePets } from '../../hooks/usePets'; // Exemplo: hook para buscar pets do usuário

import firestore from '@react-native-firebase/firestore';

const categoriasDisponiveis = ['consulta', 'medicacao', 'banho', 'outro'];

export default function AgendaScreen() {
  const { pets, loading: petsLoading } = usePets();
  const { notas, carregarNotasPorData } = useNotas();

  const [dataSelecionada, setDataSelecionada] = useState<string>(() => {
    const hoje = new Date();
    return hoje.toISOString().substring(0, 10); // "YYYY-MM-DD"
  });

  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalLembreteVisivel, setModalLembreteVisivel] = useState(false);
  const [lembreteEditar, setLembreteEditar] = useState<Lembrete | null>(null);

  const [modalFiltroVisivel, setModalFiltroVisivel] = useState(false);
  const [filtroPets, setFiltroPets] = useState<string[]>([]);
  const [filtroCategorias, setFiltroCategorias] = useState<string[]>([]);

  const [notasDoDia, setNotasDoDia] = useState([]);

  // Função para buscar lembretes no período do mês da data selecionada (para marcações do calendário)
  const buscarLembretesMes = useCallback(async () => {
    if (!dataSelecionada) return;

    setLoading(true);

    try {
      const ano = Number(dataSelecionada.substring(0, 4));
      const mes = Number(dataSelecionada.substring(5, 7)) - 1; // zero-based

      const primeiroDia = firestore.Timestamp.fromDate(new Date(ano, mes, 1, 0, 0, 0));
      const ultimoDia = firestore.Timestamp.fromDate(new Date(ano, mes + 1, 0, 23, 59, 59));

      let todosLembretes = await AgendaService.buscarLembretesPorPeriodo(primeiroDia, ultimoDia);

      // Aplicar filtros de pets e categoria
      if (filtroPets.length) {
        todosLembretes = todosLembretes.filter(l => filtroPets.includes(l.petId));
      }

      if (filtroCategorias.length) {
        todosLembretes = todosLembretes.filter(l => filtroCategorias.includes(l.categoria));
      }

      setLembretes(todosLembretes);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar lembretes');
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [dataSelecionada, filtroPets, filtroCategorias]);

  // Filtrar lembretes só do dia selecionado para a lista abaixo do calendário
  const lembretesDoDia = lembretes.filter(l => {
    const dataLembrete = l.dataHora.toDate ? l.dataHora.toDate() : new Date(l.dataHora);
    const strData = dataLembrete.toISOString().substring(0, 10);
    return strData === dataSelecionada;
  });

  // Atualiza notas do dia selecionado (assume que useNotas tem método para isso)
  useEffect(() => {
    carregarNotasPorData(dataSelecionada)
      .then(d => setNotasDoDia(d))
      .catch(() => setNotasDoDia([]));
  }, [dataSelecionada]);

  // Atualiza lembretes quando data ou filtros mudam
  useEffect(() => {
    buscarLembretesMes();
  }, [buscarLembretesMes]);

  // Handlers para as ações dos lembretes
  function abrirModalNovoLembrete() {
    setLembreteEditar(null);
    setModalLembreteVisivel(true);
  }

  function abrirModalEditarLembrete(lembrete: Lembrete) {
    setLembreteEditar(lembrete);
    setModalLembreteVisivel(true);
  }

  async function salvarLembrete(lembrete: Lembrete) {
    try {
      if (lembrete.id) {
        await AgendaService.editarLembrete(lembrete.id, {
          titulo: lembrete.titulo,
          descricao: lembrete.descricao,
          categoria: lembrete.categoria,
          petId: lembrete.petId,
          dataHora: firestore.Timestamp.fromDate(lembrete.dataHora),
          concluido: lembrete.concluido,
        });
      } else {
        await AgendaService.adicionarLembrete({
          ...lembrete,
          dataHora: firestore.Timestamp.fromDate(lembrete.dataHora),
          criadoEm: firestore.FieldValue.serverTimestamp() as any,
        });
      }
      await buscarLembretesMes();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o lembrete.');
      console.log(error);
    }
  }

  async function excluirLembrete(id: string) {
    try {
      await AgendaService.excluirLembrete(id);
      await buscarLembretesMes();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir o lembrete.');
      console.log(error);
    }
  }

  async function toggleConcluido(id: string, concluido: boolean) {
    try {
      await AgendaService.editarLembrete(id, { concluido });
      await buscarLembretesMes();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar status do lembrete.');
      console.log(error);
    }
  }

  function aplicarFiltros(petsSelecionados: string[], categoriasSelecionadas: string[]) {
    setFiltroPets(petsSelecionados);
    setFiltroCategorias(categoriasSelecionadas);
    setModalFiltroVisivel(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      {petsLoading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      {!petsLoading && (
        <>
          <View style={styles.header}>
            <Text style={styles.titulo}>Agenda</Text>
            <TouchableOpacity onPress={() => setModalFiltroVisivel(true)} style={styles.btnFiltro}>
              <Icon name="filter-variant" size={28} color="#007bff" />
            </TouchableOpacity>
          </View>

          <Calendario pets={pets} eventos={lembretes} onDayPress={setDataSelecionada} />

          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : (
            <ListaLembretes
              pets={pets}
              lembretes={lembretesDoDia}
              onEditar={abrirModalEditarLembrete}
              onExcluir={excluirLembrete}
              onToggleConcluido={toggleConcluido}
            />
          )}

          <Text style={styles.subtitulo}>Notas do dia</Text>
          <ListaNotas notas={notasDoDia} onPressNota={(nota) => Alert.alert('Nota', nota.titulo)} />

          <TouchableOpacity style={styles.fab} onPress={abrirModalNovoLembrete}>
            <Icon name="plus" size={28} color="white" />
          </TouchableOpacity>

          <ModalLembrete
            visible={modalLembreteVisivel}
            onClose={() => setModalLembreteVisivel(false)}
            onSave={salvarLembrete}
            pets={pets}
            lembreteEditar={lembreteEditar}
          />

          <FiltrosAgenda
            visible={modalFiltroVisivel}
            pets={pets}
            categorias={categoriasDisponiveis}
            filtrosAtuais={{
              petsSelecionados: filtroPets,
              categoriasSelecionadas: filtroCategorias,
            }}
            onClose={() => setModalFiltroVisivel(false)}
            onAplicarFiltros={aplicarFiltros}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  btnFiltro: {
    padding: 6,
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#444',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007bff',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
