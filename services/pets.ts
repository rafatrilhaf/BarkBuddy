// src/services/pets.ts
import * as ImageManipulator from 'expo-image-manipulator';
import {
  addDoc, collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { db } from "./firebase";

const BASE_URL = "http://10.0.2.2:8080";

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

const col = collection(db, "pets");

// remove undefined (Firestore doesn't like undefined)
function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Record<string, any> = {};
  for (const k of Object.keys(obj)) {
    const v = (obj as any)[k];
    if (v !== undefined) out[k] = v;
  }
  return out as Partial<T>;
}

// ---------------- compressão + upload ----------------
async function compressAndUpload(uri: string) {
  // Reduz tamanho da imagem para largura máxima 1024px
  const manipResult = await ImageManipulator.manipulateAsync(uri, [
    { resize: { width: 1024 } }
  ], { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG });

  // Detecta mime e filename
  const filename = "photo.jpg";
  const mime = "image/jpeg";

  const form = new FormData();
  form.append("file", {
    uri: manipResult.uri,
    name: filename,
    type: mime
  } as any);

  const resp = await fetch(`${BASE_URL}/files/upload`, { method: "POST", body: form });
  if (!resp.ok) throw new Error(`Falha no upload (${resp.status})`);
  const json = await resp.json();
  return json.url?.startsWith("http") ? json.url : `${BASE_URL}${json.url}`;
}

// Upload de imagem do pet
export const uploadPetImageLocal = compressAndUpload;

// CRUD Firestore
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

export const subscribeMyPets = (userId: string, cb: (pets: any[]) => void) => {
  const q = query(col, where("userId", "==", userId), orderBy("createdAt","desc"));
  return onSnapshot(q, (ss) => {
    cb(ss.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};
