// services/agenda.ts
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Lembrete {
  id?: string;
  userId: string;
  petId: string;
  titulo: string;
  descricao?: string;
  categoria: 'consulta' | 'medicacao' | 'banho' | 'outro';
  dataHora: Timestamp;
  concluido: boolean;
  criadoEm: Timestamp;
}

export interface Nota {
  id?: string;
  userId: string;
  petId: string;
  titulo: string;
  texto: string;
  data: string;
  criadoEm: Timestamp;
}

// Collections
const colecaoLembretes = collection(db, 'lembretes');
const colecaoPets = collection(db, 'pets');

export const AgendaService = {
  
  async adicionarLembrete(lembrete: Omit<Lembrete, 'id' | 'criadoEm'>) {
    const docRef = await addDoc(colecaoLembretes, {
      ...lembrete,
      criadoEm: serverTimestamp(),
    });
    return docRef.id;
  },

  async editarLembrete(id: string, dados: Partial<Lembrete>) {
    const lembreteRef = doc(db, 'lembretes', id);
    await updateDoc(lembreteRef, dados);
  },

  async excluirLembrete(id: string) {
    const lembreteRef = doc(db, 'lembretes', id);
    await deleteDoc(lembreteRef);
  },

  async buscarLembretesPorPeriodo(
    dataInicio: Timestamp,
    dataFim: Timestamp,
    userId: string
  ): Promise<Lembrete[]> {
    const q = query(
      colecaoLembretes,
      where('userId', '==', userId),
      where('dataHora', '>=', dataInicio),
      where('dataHora', '<=', dataFim),
      orderBy('dataHora', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Lembrete[];
  },

  async buscarLembretesPorPet(
    userId: string,
    petId: string,
    dataInicio?: Timestamp,
    dataFim?: Timestamp,
    categoria?: string,
  ): Promise<Lembrete[]> {
    let q = query(
      colecaoLembretes, 
      where('userId', '==', userId),
      where('petId', '==', petId)
    );

    if (dataInicio && dataFim) {
      q = query(q, where('dataHora', '>=', dataInicio), where('dataHora', '<=', dataFim));
    }

    if (categoria) {
      q = query(q, where('categoria', '==', categoria));
    }

    q = query(q, orderBy('dataHora', 'asc'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Lembrete[];
  },

  async buscarLembretesPorUsuario(userId: string): Promise<Lembrete[]> {
    const q = query(
      colecaoLembretes,
      where('userId', '==', userId),
      orderBy('dataHora', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Lembrete[];
  },

  async marcarComoConcluido(id: string) {
    const lembreteRef = doc(db, 'lembretes', id);
    await updateDoc(lembreteRef, {
      concluido: true,
      concluidoEm: serverTimestamp(),
    });
  },

  // ✅ NOVO: Buscar notas dos pets por data
  async buscarNotasPorData(userId: string, data: string): Promise<Nota[]> {
    try {
      // Primeiro buscar os pets do usuário
      const petsQuery = query(colecaoPets, where('userId', '==', userId));
      const petsSnapshot = await getDocs(petsQuery);
      
      const notas: Nota[] = [];
      
      // Para cada pet, buscar suas notas (records do tipo 'note')
      for (const petDoc of petsSnapshot.docs) {
        const petId = petDoc.id;
        const recordsRef = collection(db, 'pets', petId, 'records');
        
        const notesQuery = query(
          recordsRef,
          where('type', '==', 'note'),
          orderBy('createdAt', 'desc')
        );
        
        const notesSnapshot = await getDocs(notesQuery);
        
        for (const noteDoc of notesSnapshot.docs) {
          const noteData = noteDoc.data();
          const noteDate = noteData.createdAt?.toDate();
          
          if (noteDate) {
            const noteDateStr = noteDate.toISOString().substring(0, 10);
            
            if (noteDateStr === data) {
              notas.push({
                id: noteDoc.id,
                userId,
                petId,
                titulo: noteData.value?.title || 'Nota sem título',
                texto: noteData.value?.content || noteData.note || '',
                data: noteDateStr,
                criadoEm: noteData.createdAt,
              });
            }
          }
        }
      }
      
      return notas.sort((a, b) => b.criadoEm.toDate().getTime() - a.criadoEm.toDate().getTime());
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
      return [];
    }
  },
};
