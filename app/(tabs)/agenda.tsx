// app/(tabs)/agenda.tsx

import { Ionicons } from '@expo/vector-icons';
import { Timestamp } from 'firebase/firestore';
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
import { Calendario } from '../../components/Calendario';
import { FiltrosAgenda } from '../../components/FiltrosAgenda';
import { ListaLembretes } from '../../components/ListaLembretes';
import { ListaNotas } from '../../components/ListaNotas';
import { ModalLembrete } from '../../components/ModalLembrete';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { AgendaService, Lembrete } from '../../services/agenda';
import { auth } from '../../services/firebase';
import { getMyPets } from '../../services/pets';

const categoriasDisponiveis = ['consulta', 'medicacao', 'banho', 'outro'];

// Cores padrão para pets (pode ser expandido)
const coresPets = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4'];

// Tipo para Pet com id (retornado de getMyPets)
interface PetComId {
  id: string;
  name: string;
  userId: string;
  species?: string;
  breed?: string;
  age?: number;
  notes?: string;
  lost?: boolean;
  photoUrl?: string;
  createdAt?: any;
  updatedAt?: any;
}

export default function AgendaScreen() {
  const { colors, fontSizes, isDark } = useTheme();
  const { t } = useLanguage();
  
  const [pets, setPets] = useState<PetComId[]>([]);
  const [petsLoading, setPetsLoading] = useState(true);
  const [notas, setNotas] = useState<any[]>([]);

  const [dataSelecionada, setDataSelecionada] = useState<string>(() => {
    const hoje = new Date();
    return hoje.toISOString().substring(0, 10); // "YYYY-MM-DD"
  });

  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalLembreteVisivel, setModalLembreteVisivel] = useState(false);
  const [lembreteEditar, setLembreteEditar] = useState<any>(null);

  const [modalFiltroVisivel, setModalFiltroVisivel] = useState(false);
  const [filtroPets, setFiltroPets] = useState<string[]>([]);
  const [filtroCategorias, setFiltroCategorias] = useState<string[]>([]);

  const [notasDoDia, setNotasDoDia] = useState<any[]>([]);

  // Carregar pets do usuário
  useEffect(() => {
    const carregarPets = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const petsData = await getMyPets(user.uid);
          setPets(petsData as PetComId[]);
        }
      } catch (error) {
        console.error('Erro ao carregar pets:', error);
      } finally {
        setPetsLoading(false);
      }
    };

    carregarPets();
  }, []);

  // Função para buscar lembretes no período do mês da data selecionada
  const buscarLembretesMes = useCallback(async () => {
    if (!dataSelecionada) return;

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert(t('general.error'), 'Usuário não autenticado');
        return;
      }

      const ano = Number(dataSelecionada.substring(0, 4));
      const mes = Number(dataSelecionada.substring(5, 7)) - 1; // zero-based

      const primeiroDia = Timestamp.fromDate(new Date(ano, mes, 1, 0, 0, 0));
      const ultimoDia = Timestamp.fromDate(new Date(ano, mes + 1, 0, 23, 59, 59));

      let todosLembretes = await AgendaService.buscarLembretesPorPeriodo(
        primeiroDia, 
        ultimoDia, 
        user.uid
      );

      // Aplicar filtros de pets e categoria
      if (filtroPets.length) {
        todosLembretes = todosLembretes.filter(l => filtroPets.includes(l.petId));
      }

      if (filtroCategorias.length) {
        todosLembretes = todosLembretes.filter(l => filtroCategorias.includes(l.categoria));
      }

      setLembretes(todosLembretes);

      // Buscar notas do dia selecionado
      await buscarNotasDoDia(user.uid, dataSelecionada);
    } catch (error) {
      Alert.alert(t('general.error'), 'Erro ao carregar lembretes');
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [dataSelecionada, filtroPets, filtroCategorias, t]);

  // Buscar notas dos pets para o dia selecionado
  const buscarNotasDoDia = async (userId: string, data: string) => {
    try {
      const notasEncontradas = await AgendaService.buscarNotasPorData(userId, data);
      setNotasDoDia(notasEncontradas);
    } catch (error) {
      console.log('Erro ao buscar notas:', error);
      setNotasDoDia([]);
    }
  };

  // Filtrar lembretes só do dia selecionado para a lista abaixo do calendário
  const lembretesDoDia = lembretes.filter(l => {
    const dataLembrete = l.dataHora.toDate();
    const strData = dataLembrete.toISOString().substring(0, 10);
    return strData === dataSelecionada;
  });

  // Transformar lembretes em eventos para o calendário
  const eventosCalendario = lembretes.map(lembrete => {
    const dataLembrete = lembrete.dataHora.toDate();
    return {
      id: lembrete.id || '',
      petId: lembrete.petId,
      data: dataLembrete.toISOString().substring(0, 10),
    };
  });

  // Transformar pets para o formato esperado pelo calendário e componentes
  const petsCalendario = pets.map((pet, index) => ({
    id: pet.id,
    nome: pet.name,
    cor: coresPets[index % coresPets.length],
  }));

  // Transformar lembretes para o formato esperado pelos componentes
  const lembretesFormatados = lembretesDoDia.map(lembrete => ({
    id: lembrete.id!,
    petId: lembrete.petId,
    titulo: lembrete.titulo,
    descricao: lembrete.descricao,
    categoria: lembrete.categoria,
    dataHora: lembrete.dataHora.toDate(),
    concluido: lembrete.concluido,
    criadoEm: lembrete.criadoEm.toDate(),
  }));

  // Atualiza lembretes quando data ou filtros mudam
  useEffect(() => {
    if (!petsLoading) {
      buscarLembretesMes();
    }
  }, [buscarLembretesMes, petsLoading]);

  // Função para lidar com seleção de data no calendário
  const handleDayPress = (data: string) => {
    if (dataSelecionada === data) {
      // Se clicou no mesmo dia, limpa a seleção
      const hoje = new Date();
      setDataSelecionada(hoje.toISOString().substring(0, 10));
    } else {
      setDataSelecionada(data);
    }
  };

  // Handlers para as ações dos lembretes
  function abrirModalNovoLembrete() {
    setLembreteEditar(null);
    setModalLembreteVisivel(true);
  }

  function abrirModalEditarLembrete(lembrete: any) {
    setLembreteEditar(lembrete);
    setModalLembreteVisivel(true);
  }

  async function salvarLembrete(lembrete: any) {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert(t('general.error'), 'Usuário não autenticado');
        return;
      }

      if (lembrete.id) {
        // Editar lembrete existente
        await AgendaService.editarLembrete(lembrete.id, {
          titulo: lembrete.titulo,
          descricao: lembrete.descricao,
          categoria: lembrete.categoria,
          petId: lembrete.petId,
          dataHora: Timestamp.fromDate(new Date(lembrete.dataHora)),
          concluido: lembrete.concluido,
        });
      } else {
        // Criar novo lembrete com userId
        const novoLembrete = {
          userId: user.uid,
          petId: lembrete.petId,
          titulo: lembrete.titulo,
          descricao: lembrete.descricao,
          categoria: lembrete.categoria,
          dataHora: Timestamp.fromDate(new Date(lembrete.dataHora)),
          concluido: lembrete.concluido || false,
        };
        await AgendaService.adicionarLembrete(novoLembrete);
      }
      await buscarLembretesMes();
      Alert.alert(t('general.success'), t('agenda.reminderSaved'));
    } catch (error) {
      Alert.alert(t('general.error'), 'Não foi possível salvar o lembrete.');
      console.log(error);
    }
  }

  async function excluirLembrete(id: string) {
    Alert.alert(
      t('general.confirm'),
      t('agenda.deleteConfirm'),
      [
        { text: t('general.cancel'), style: 'cancel' },
        {
          text: t('general.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await AgendaService.excluirLembrete(id);
              await buscarLembretesMes();
              Alert.alert(t('general.success'), t('agenda.reminderDeleted'));
            } catch (error) {
              Alert.alert(t('general.error'), 'Não foi possível excluir o lembrete.');
              console.log(error);
            }
          },
        },
      ]
    );
  }

  async function toggleConcluido(id: string, concluido: boolean) {
    try {
      await AgendaService.editarLembrete(id, { concluido });
      await buscarLembretesMes();
    } catch (error) {
      Alert.alert(t('general.error'), 'Erro ao atualizar status do lembrete.');
      console.log(error);
    }
  }

  function aplicarFiltros(petsSelecionados: string[], categoriasSelecionadas: string[]) {
    setFiltroPets(petsSelecionados);
    setFiltroCategorias(categoriasSelecionadas);
    setModalFiltroVisivel(false);
  }

  if (petsLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" style={{ marginTop: 20 }} color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.titulo, { color: colors.text, fontSize: fontSizes.xxl }]}>
          {t('agenda.title')}
        </Text>
        <TouchableOpacity onPress={() => setModalFiltroVisivel(true)} style={styles.btnFiltro}>
          <Ionicons name="filter" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.calendarioContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Calendario 
          pets={petsCalendario} 
          eventos={eventosCalendario} 
          onDayPress={handleDayPress}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <ListaLembretes
            pets={petsCalendario}
            lembretes={lembretesFormatados}
            onEditar={abrirModalEditarLembrete}
            onExcluir={excluirLembrete}
            onToggleConcluido={toggleConcluido}
          />
          
          <View style={styles.notasSection}>
            <Text style={[styles.subtitulo, { color: colors.text, fontSize: fontSizes.lg }]}>
              {t('agenda.notesOfDay')}
            </Text>
            <ListaNotas 
              notas={notasDoDia} 
              onPressNota={(nota) => Alert.alert('Nota', nota.titulo)} 
            />
          </View>
        </View>
      )}

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={abrirModalNovoLembrete}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <ModalLembrete
  visible={modalLembreteVisivel}
  onClose={() => setModalLembreteVisivel(false)}
  onSave={salvarLembrete}
  pets={petsCalendario}
  lembreteEditar={lembreteEditar}
  dataSelecionada={dataSelecionada} // ✅ ADICIONADO: Passa a data selecionada
/>

      <FiltrosAgenda
        visible={modalFiltroVisivel}
        pets={petsCalendario}
        categorias={categoriasDisponiveis}
        filtrosAtuais={{
          petsSelecionados: filtroPets,
          categoriasSelecionadas: filtroCategorias,
        }}
        onClose={() => setModalFiltroVisivel(false)}
        onAplicarFiltros={aplicarFiltros}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  titulo: {
    fontWeight: 'bold',
  },
  btnFiltro: {
    padding: 8,
  },
  calendarioContainer: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  notasSection: {
    marginTop: 20,
    paddingBottom: 100, // Espaço para o FAB
  },
  subtitulo: {
    fontWeight: '600',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
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
