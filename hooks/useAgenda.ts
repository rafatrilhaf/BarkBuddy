// hooks/useAgenda.ts

import { Timestamp } from 'firebase/firestore';
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
  salvarLembrete: (lembrete: Omit<Lembrete, 'criadoEm'>) => Promise<void>;
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

      const primeiroDia = Timestamp.fromDate(new Date(ano, mes, 1, 0, 0, 0));
      const ultimoDia = Timestamp.fromDate(new Date(ano, mes + 1, 0, 23, 59, 59));

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
    async (lembrete: Omit<Lembrete, 'criadoEm'>) => {
      try {
        if (lembrete.id) {
          // Editar lembrete existente
          await AgendaService.editarLembrete(lembrete.id, {
            titulo: lembrete.titulo,
            descricao: lembrete.descricao,
            categoria: lembrete.categoria,
            petId: lembrete.petId,
            dataHora: typeof lembrete.dataHora === 'string' 
              ? Timestamp.fromDate(new Date(lembrete.dataHora))
              : lembrete.dataHora,
            concluido: lembrete.concluido,
          });
        } else {
          // Criar novo lembrete
          const novoLembrete = {
            titulo: lembrete.titulo,
            descricao: lembrete.descricao,
            categoria: lembrete.categoria,
            petId: lembrete.petId,
            dataHora: typeof lembrete.dataHora === 'string' 
              ? Timestamp.fromDate(new Date(lembrete.dataHora))
              : lembrete.dataHora,
            concluido: lembrete.concluido || false,
          };
          
          await AgendaService.adicionarLembrete(novoLembrete);
        }
        await buscarLembretesMes();
      } catch (error) {
        console.error('Erro ao salvar lembrete:', error);
        throw error;
      }
    },
    [buscarLembretesMes],
  );

  const excluirLembrete = useCallback(
    async (id: string) => {
      try {
        await AgendaService.excluirLembrete(id);
        await buscarLembretesMes();
      } catch (error) {
        console.error('Erro ao excluir lembrete:', error);
        throw error;
      }
    },
    [buscarLembretesMes],
  );

  const toggleConcluido = useCallback(
    async (id: string, concluido: boolean) => {
      try {
        await AgendaService.editarLembrete(id, { concluido });
        await buscarLembretesMes();
      } catch (error) {
        console.error('Erro ao alterar status do lembrete:', error);
        throw error;
      }
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

export default useAgenda;
