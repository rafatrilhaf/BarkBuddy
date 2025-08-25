// src/services/pets.ts
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
import { Platform } from "react-native"; // 👈 novo
import { db } from "./firebase";

// 👇 base do servidor local
const BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:8080" : // emulador Android
  "http://localhost:8080";                               // web/iOS simulador/desktop

export type Pet = {
  name: string;
  userId: string;
  species?: string;   // cão, gato...
  breed?: string;
  age?: number;
  notes?: string;
  lost?: boolean;
  photoUrl?: string;  // 👈 novo
  createdAt?: any;
  updatedAt?: any;
};

const col = collection(db, "pets");

// 🔧 helper: tira chaves undefined (Firestore não aceita undefined)
function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Record<string, any> = {};
  for (const k of Object.keys(obj)) {
    const v = (obj as any)[k];
    if (v !== undefined) out[k] = v;
  }
  return out as Partial<T>;
}

// 👉 Upload local usando Blob (funciona no Android/iOS/Web)
export const uploadPetImageLocal = async (localUri: string) => {
  // 1) lê o arquivo e cria um Blob
  const fileResp = await fetch(localUri);
  let blob = await fileResp.blob();

  // 2) Garante um content-type de imagem (alguns retornam application/octet-stream)
  const guessExt = (uri: string) => {
    const ext = uri.split("?")[0].split("#")[0].split(".").pop()?.toLowerCase();
    if (ext === "png") return { mime: "image/png", filename: "photo.png" };
    if (ext === "webp") return { mime: "image/webp", filename: "photo.webp" };
    if (ext === "jpg" || ext === "jpeg") return { mime: "image/jpeg", filename: "photo.jpg" };
    return { mime: "image/jpeg", filename: "photo.jpg" };
  };
  const { mime, filename } = guessExt(localUri);
  if (!blob.type || blob.type === "application/octet-stream") {
    // redefine o tipo do blob (mantém os bytes, muda o MIME)
    blob = blob.slice(0, blob.size, mime);
  }

  // 3) monta o FormData com Blob + filename
  const form = new FormData();
  // Algumas definições de tipo do RN pedem "as any" aqui
  form.append("file", blob as any, filename);

  // 4) envia
  const resp = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: form,
    // NÃO defina manualmente "Content-Type"
  });

  if (!resp.ok) {
    const t = await resp.text().catch(() => "");
    throw new Error(`Falha no upload (${resp.status}) ${t}`);
  }
  const json = await resp.json();
  return json.publicUrl as string;
};

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
  const q = query(col, where("userId", "==", userId), orderBy("createdAt","desc")); // 👈 ordenado
  const ss = await getDocs(q);
  return ss.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
};

// live updates
export const subscribeMyPets = (userId: string, cb: (pets: any[]) => void) => {
  const q = query(col, where("userId", "==", userId), orderBy("createdAt","desc")); // 👈 ordenado
  return onSnapshot(q, (ss) => {
    cb(ss.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};
