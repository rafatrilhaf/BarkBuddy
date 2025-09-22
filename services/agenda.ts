import firestore from '@react-native-firebase/firestore';

export interface Lembrete {
  id?: string;
  petId: string;
  titulo: string;
  descricao?: string;
  categoria: 'consulta' | 'medicacao' | 'banho' | 'outro';
  dataHora: FirebaseFirestoreTypes.Timestamp; // data e hora do evento
  concluido: boolean;
  criadoEm: FirebaseFirestoreTypes.Timestamp;
}

// Nome da collection no Firestore
const colecao = firestore().collection('lembretes');

export const AgendaService = {
  
  async adicionarLembrete(lembrete: Lembrete) {
    const docRef = colecao.doc();
    await docRef.set({
      ...lembrete,
      criadoEm: firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
  },

  async editarLembrete(id: string, dados: Partial<Lembrete>) {
    await colecao.doc(id).update(dados);
  },

  async excluirLembrete(id: string) {
    await colecao.doc(id).delete();
  },

  // Busca lembretes de um usuário por data (ex: no mês/dia)
  // Ajuste para buscar lembretes entre data início e fim (timestamp)
  async buscarLembretesPorPeriodo(
    dataInicio: FirebaseFirestoreTypes.Timestamp,
    dataFim: FirebaseFirestoreTypes.Timestamp,
  ): Promise<Lembrete[]> {
    const snapshot = await colecao
      .where('dataHora', '>=', dataInicio)
      .where('dataHora', '<=', dataFim)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Lembrete[];
  },

  // Buscar lembretes por pet e opcionalmente categoria
  async buscarLembretesPorPet(
    petId: string,
    dataInicio?: FirebaseFirestoreTypes.Timestamp,
    dataFim?: FirebaseFirestoreTypes.Timestamp,
    categoria?: string,
  ): Promise<Lembrete[]> {
    let query: FirebaseFirestoreTypes.Query = colecao.where('petId', '==', petId);

    if (dataInicio && dataFim) {
      query = query.where('dataHora', '>=', dataInicio).where('dataHora', '<=', dataFim);
    }

    if (categoria) {
      query = query.where('categoria', '==', categoria);
    }

    const snapshot = await query.get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Lembrete[];
  },
};
