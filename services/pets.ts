// src/services/pets.ts
import * as FileSystem from "expo-file-system";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { Platform } from "react-native";
import { db } from "./firebase";


const BASE_URL = Platform.select({
  android: "http://10.0.2.2:8080",
  ios: "http://192.168.1.185:8080", // troque pelo IP da sua máquina
  default: "http://localhost:8080"
});


export type Pet = {
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
};

// helper: remove undefined keys
function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Record<string, any> = {};
  for (const k of Object.keys(obj)) {
    const v = (obj as any)[k];
    if (v !== undefined) out[k] = v;
  }
  return out as Partial<T>;
}

const col = collection(db, "pets");

// Upload local image (usa o Spring Boot)
export const uploadPetImageLocal = async (localUri: string) => {
  // Descobre extensão
  const guessExt = (uri: string) => {
    const ext = uri.split("?")[0].split("#")[0].split(".").pop()?.toLowerCase();
    if (ext === "png") return "png";
    if (ext === "webp") return "webp";
    if (ext === "jpg" || ext === "jpeg") return "jpg";
    return "jpg";
  };
  const ext = guessExt(localUri);
  const filename = `photo.${ext}`;

  // Usa FileSystem.uploadAsync (funciona no Expo)
  const result = await FileSystem.uploadAsync(`${BASE_URL}/files/upload`, localUri, {
    fieldName: "file",
    httpMethod: "POST",
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (result.status !== 200) {
    throw new Error(`Falha no upload (${result.status}): ${result.body}`);
  }

  const json = JSON.parse(result.body);
  return `${BASE_URL}${json.url}`; // já retorna URL completa
};

// CRUD pets
export const addPet = (pet: Pet) =>
  addDoc(col, {
    ...stripUndefined(pet),
    lost: pet.lost ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

export const updatePet = (id: string, patch: Partial<Pet>) =>
  updateDoc(doc(db, "pets", id), {
    ...stripUndefined(patch),
    updatedAt: serverTimestamp()
  });

export const deletePetById = (id: string) =>
  deleteDoc(doc(db, "pets", id));

export const getMyPets = async (userId: string) => {
  const q = query(col, where("userId", "==", userId), orderBy("createdAt","desc"));
  const ss = await getDocs(q);
  return ss.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
};

// live updates
export const subscribeMyPets = (userId: string, cb: (pets: any[]) => void) => {
  const q = query(col, where("userId", "==", userId), orderBy("createdAt","desc"));
  return onSnapshot(q, (ss) => {
    cb(ss.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

/**
 * addPetRecord(petId, record)
 * record: { type: "WALK"|"WEIGHT"|"HEALTH"|"NOTE", value: number|string, note?: string }
 * cria um documento em: /pets/{petId}/records
 */
export const addPetRecord = async (petId: string, record: { type: string; value: any; note?: string }) => {
  const recordsRef = collection(db, "pets", petId, "records");
  return addDoc(recordsRef, {
    type: record.type,
    value: record.value,
    note: record.note ?? null,
    createdAt: serverTimestamp()
  });
};

/**
 * getLastRecordsForPet(petId)
 * pega os últimos N registros (ordenados por createdAt desc) e retorna o último por tipo
 * Retorno: { WALK?: {...}, WEIGHT?: {...}, HEALTH?: {...} }
 * Observação: limita a leitura para N (padrão 20) para economizar reads.
 */
export const getLastRecordsForPet = async (petId: string, limitCount = 50) => {
  const recordsRef = collection(db, "pets", petId, "records");
  const q = query(recordsRef, orderBy("createdAt", "desc"), limit(limitCount));
  const ss = await getDocs(q);

  const out: Record<string, any[]> = {};
  ss.docs.forEach(d => {
    const data = d.data();
    const t = data.type;
    if (!out[t]) out[t] = [];
    out[t].push({
      id: d.id,
      type: data.type,
      value: data.value,
      note: data.note ?? null,
      createdAt: data.createdAt ?? null
    });
  });

  return out; // ex: { WALK: [...], WEIGHT: [...], HEALTH: [...], NOTE: [...] }
};


// pega o último record por tipo, opcionalmente filtrando pelo value (útil para HEALTH subtype)
export const getLastRecordForType = async (petId: string, type: string, value?: any) => {
  const recordsRef = collection(db, "pets", petId, "records");
  if (value !== undefined && value !== null) {
    const q = query(recordsRef, where("type", "==", type), where("value", "==", value), orderBy("createdAt", "desc"), limit(1));
    const ss = await getDocs(q);
    if (ss.empty) return null;
    const d = ss.docs[0];
    return { id: d.id, ...d.data() };
  } else {
    const q = query(recordsRef, where("type", "==", type), orderBy("createdAt", "desc"), limit(1));
    const ss = await getDocs(q);
    if (ss.empty) return null;
    const d = ss.docs[0];
    return { id: d.id, ...d.data() };
  }
};

