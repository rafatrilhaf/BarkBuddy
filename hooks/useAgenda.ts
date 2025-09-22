// hooks/useAgenda.ts

import firestore from '@react-native-firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { AgendaService, Lembrete } from '../services/agenda';

interface UseAgendaReturn {
  dataSelecionada: string;
  setDataSelecionada: (data: string) => void;
  lembretes: Lembrete[];
  loading: boolean;
  filtroPets: string[];
  filtroCategorias: string[];
  setFiltroPets: (pets: string[]) => void;
  setFiltroCategorias: (categorias: string[]) => void;

  buscarLembretesMes: () => Promise<void>;
  salvarLembrete: (lembrete: Lembrete) => Promise<void>;
  excluirLembrete: (id: string) => Promise<void>;
  toggleConcluido: (id: string, concluido: boolean) => Promise<void>;
}

export function useAgenda(): UseAgendaReturn {
  const [dataSelecionada, setDataSelecionada] = useState<string>(() => {
    const hoje = new Date();
    return hoje.toISOString().substring(0, 10); // formato "YYYY-MM-DD"
  });

  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [loading, setLoading] = useState(false);

  const [filtroPets, setFiltroPets] = useState<string[]>([]);
  const [filtroCategorias, setFiltroCategorias] = useState<string[]>([]);

  const buscarLembretesMes = useCallback(async () => {
    setLoading(true);
    try {
      const ano = Number(dataSelecionada.substring(0, 4));
      const mes = Number(dataSelecionada.substring(5, 7)) - 1;

      const primeiroDia = firestore.Timestamp.fromDate(new Date(ano, mes, 1, 0, 0, 0));
      const ultimoDia = firestore.Timestamp.fromDate(new Date(ano, mes + 1, 0, 23, 59, 59));

      let todosLembretes = await AgendaService.buscarLembretesPorPeriodo(primeiroDia, ultimoDia);

      if (filtroPets.length) {
        todosLembretes = todosLembretes.filter(l => filtroPets.includes(l.petId));
      }

      if (filtroCategorias.length) {
        todosLembretes = todosLembretes.filter(l => filtroCategorias.includes(l.categoria));
      }

      setLembretes(todosLembretes);
    } catch (error) {
      console.error('Erro fetch lembretes agenda', error);
    } finally {
      setLoading(false);
    }
  }, [dataSelecionada, filtroPets, filtroCategorias]);

  const salvarLembrete = useCallback(
    async (lembrete: Lembrete) => {
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
          criadoEm: firestore.FieldValue.serverTimestamp() as unknown as any,
        });
      }
      await buscarLembretesMes();
    },
    [buscarLembretesMes],
  );

  const excluirLembrete = useCallback(
    async (id: string) => {
      await AgendaService.excluirLembrete(id);
      await buscarLembretesMes();
    },
    [buscarLembretesMes],
  );

  const toggleConcluido = useCallback(
    async (id: string, concluido: boolean) => {
      await AgendaService.editarLembrete(id, { concluido });
      await buscarLembretesMes();
    },
    [buscarLembretesMes],
  );

  // Atualiza os lembretes sempre que a data ou filtros mudam
  useEffect(() => {
    buscarLembretesMes();
  }, [buscarLembretesMes]);

  return {
    dataSelecionada,
    setDataSelecionada,
    lembretes,
    loading,
    filtroPets,
    filtroCategorias,
    setFiltroPets,
    setFiltroCategorias,
    buscarLembretesMes,
    salvarLembrete,
    excluirLembrete,
    toggleConcluido,
  };
}
