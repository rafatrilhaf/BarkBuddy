import * as ImageManipulator from "expo-image-manipulator";
import {
  addDoc, collection, deleteDoc, doc, getDocs, onSnapshot,
  orderBy, query, serverTimestamp, updateDoc, where
} from "firebase/firestore";
import { Platform } from "react-native";
import { db } from "./firebase";

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

// 🔧 Configura BASE_URL
const BASE_URL =
  Platform.OS === "android"
    ? "http://192.168.1.185:8080" // ⚠️ Coloque o IP da sua máquina
    : "http://192.168.1.185:8080";

const col = collection(db, "pets");

function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Record<string, any> = {};
  for (const k of Object.keys(obj)) {
    const v = (obj as any)[k];
    if (v !== undefined) out[k] = v;
  }
  return out as Partial<T>;
}

// Upload de imagem com compressão
export const uploadPetImageLocal = async (localUri: string) => {
  const manipResult = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: 1024 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  const filename = "photo.jpg";
  const mime = "image/jpeg";

  const form = new FormData();
  form.append("file", {
    uri: manipResult.uri,
    name: filename,
    type: mime,
  } as any);

  const resp = await fetch(`${BASE_URL}/files/upload`, { method: "POST", body: form });
  if (!resp.ok) throw new Error(`Falha no upload (${resp.status})`);
  const json = await resp.json();
  return json.url?.startsWith("http") ? json.url : `${BASE_URL}${json.url}`;
};

// CRUD Firestore
export const addPet = (pet: Pet) =>
  addDoc(col, { ...stripUndefined(pet), lost: pet.lost ?? false, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

export const updatePet = (id: string, patch: Partial<Pet>) =>
  updateDoc(doc(db, "pets", id), { ...stripUndefined(patch), updatedAt: serverTimestamp() });

export const deletePetById = (id: string) =>
  deleteDoc(doc(db, "pets", id));

export const getMyPets = async (userId: string) => {
  const q = query(col, where("userId", "==", userId), orderBy("createdAt", "desc"));
  const ss = await getDocs(q);
  return ss.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
};

export const subscribeMyPets = (userId: string, cb: (pets: any[]) => void) => {
  const q = query(col, where("userId", "==", userId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (ss) => {
    cb(ss.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};
