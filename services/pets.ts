// src/services/pets.ts
import * as FileSystem from "expo-file-system/legacy";
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
  where,
  writeBatch,
} from "firebase/firestore";
import { Platform } from "react-native";
import { db } from "./firebase";

// Config base API local
const BASE_URL = Platform.select({
  android: "http://10.0.2.2:8080",
  ios: "http://192.168.1.185:8080", // troque pelo IP da sua máquina
  default: "http://localhost:8080",
});

// === Tipos ===
export type Pet = {
  name: string;
  userId: string;
  species?: string;
  breed?: string;
  age?: number;
  notes?: string;
  lost?: boolean;
  photoUrl?: string;
  lastLocation?: PetLocation | null; // ✅ agora incluso
  createdAt?: any;
  updatedAt?: any;
};

export type PetLocation = {
  latitude: number;
  longitude: number;
  address?: string | null;
  accuracy?: number | null; // ✅ ADICIONADO: campo accuracy
  updatedAt?: any; // timestamp do Firestore
  createdAt?: any; // para subcoleções
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

// === Upload de imagem (via Spring Boot) ===
export const uploadPetImageLocal = async (localUri: string) => {
  const guessExt = (uri: string) => {
    const ext = uri.split("?")[0].split("#")[0].split(".").pop()?.toLowerCase();
    if (ext === "png") return "png";
    if (ext === "webp") return "webp";
    if (ext === "jpg" || ext === "jpeg") return "jpg";
    return "jpg";
  };
  const ext = guessExt(localUri);

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
  return `${BASE_URL}${json.url}`;
};

// === CRUD pets ===
export const addPet = (pet: Pet) =>
  addDoc(col, {
    ...stripUndefined(pet),
    lost: pet.lost ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updatePet = (id: string, patch: Partial<Pet>) =>
  updateDoc(doc(db, "pets", id), {
    ...stripUndefined(patch),
    updatedAt: serverTimestamp(),
  });

export const deletePetById = (id: string) =>
  deleteDoc(doc(db, "pets", id));

export const getMyPets = async (userId: string) => {
  const q = query(col, where("userId", "==", userId), orderBy("createdAt", "desc"));
  const ss = await getDocs(q);
  return ss.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
};

export const subscribeMyPets = (userId: string, cb: (pets: any[]) => void) => {
  const q = query(col, where("userId", "==", userId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (ss) => {
    cb(ss.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// === Localização (subcoleção /pets/{petId}/locations) ===
export const addPetLocation = async (petId: string, loc: PetLocation) => {
  const locRef = collection(db, "pets", petId, "locations");
  return addDoc(locRef, {
    latitude: loc.latitude,
    longitude: loc.longitude,
    address: loc.address ?? null,
    accuracy: loc.accuracy ?? null, // ✅ ADICIONADO: accuracy
    createdAt: serverTimestamp(),
  });
};

export const getLastLocationForPet = async (petId: string) => {
  const locRef = collection(db, "pets", petId, "locations");
  const q = query(locRef, orderBy("createdAt", "desc"), limit(1));
  const ss = await getDocs(q);
  if (ss.empty) return null;
  const d = ss.docs[0];
  return { id: d.id, ...d.data() } as PetLocation & { id: string };
};

export const subscribeLastLocationForPet = (
  petId: string,
  cb: (loc: (PetLocation & { id: string }) | null) => void
) => {
  const locRef = collection(db, "pets", petId, "locations");
  const q = query(locRef, orderBy("createdAt", "desc"), limit(1));
  return onSnapshot(q, (ss) => {
    if (ss.empty) {
      cb(null);
      return;
    }
    const d = ss.docs[0];
    cb({ id: d.id, ...d.data() } as PetLocation & { id: string });
  });
};

// === Registro de atividades (records) ===
export const addPetRecord = async (
  petId: string,
  record: { type: string; value: any; note?: string }
) => {
  const recordsRef = collection(db, "pets", petId, "records");
  return addDoc(recordsRef, {
    type: record.type,
    value: record.value,
    note: record.note ?? null,
    createdAt: serverTimestamp(),
  });
};

export const getLastRecordsForPet = async (petId: string, limitCount = 50) => {
  const recordsRef = collection(db, "pets", petId, "records");
  const q = query(recordsRef, orderBy("createdAt", "desc"), limit(limitCount));
  const ss = await getDocs(q);

  const out: Record<string, any[]> = {};
  ss.docs.forEach((d) => {
    const data = d.data();
    const t = data.type;
    if (!out[t]) out[t] = [];
    out[t].push({
      id: d.id,
      type: data.type,
      value: data.value,
      note: data.note ?? null,
      createdAt: data.createdAt ?? null,
    });
  });

  return out;
};

export const getLastRecordForType = async (
  petId: string,
  type: string,
  value?: any
) => {
  const recordsRef = collection(db, "pets", petId, "records");
  if (value !== undefined && value !== null) {
    const q = query(
      recordsRef,
      where("type", "==", type),
      where("value", "==", value),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    const ss = await getDocs(q);
    if (ss.empty) return null;
    const d = ss.docs[0];
    return { id: d.id, ...d.data() };
  } else {
    const q = query(
      recordsRef,
      where("type", "==", type),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    const ss = await getDocs(q);
    if (ss.empty) return null;
    const d = ss.docs[0];
    return { id: d.id, ...d.data() };
  }
};

// ✅ === SCRIPT DE MIGRAÇÃO ===
// Execute uma vez para adicionar o campo accuracy em documentos existentes
export const migrateAccuracyField = async () => {
  try {
    console.log("🔄 Iniciando migração do campo accuracy...");
    
    const snapshot = await getDocs(col);
    const batch = writeBatch(db);
    let updatedCount = 0;

    snapshot.forEach((document) => {
      const data = document.data();
      
      // Se o pet tem lastLocation mas não tem accuracy
      if (data.lastLocation && data.lastLocation.accuracy === undefined) {
        batch.update(document.ref, {
          "lastLocation.accuracy": null // Define como null por padrão
        });
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
      console.log(`✅ Migração concluída: ${updatedCount} pets atualizados com campo accuracy`);
      return {
        success: true,
        message: `${updatedCount} pets atualizados com sucesso`,
        updatedCount
      };
    } else {
      console.log("ℹ️ Nenhum pet precisava de migração");
      return {
        success: true,
        message: "Nenhum pet precisava de migração",
        updatedCount: 0
      };
    }
    
  } catch (error) {
    console.error("❌ Erro na migração:", error);
    return {
      success: false,
      message: `Erro na migração: ${error}`,
      updatedCount: 0
    };
  }
};
