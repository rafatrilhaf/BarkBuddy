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
import { db } from "./firebase";

// 👇 testing on Android emulator
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

/**
 * Upload de imagem usando FormData padrão do RN:
 * - NÃO faz fetch(localUri).blob() (instável no Expo Android)
 * - Usa form.append('file', { uri, name, type })
 * Retorna a URL completa para usar no <Image />
 */
export const uploadPetImageLocal = async (localUri: string) => {
  console.log("uploadPetImageLocal -> localUri:", localUri);
  // Detecta mime e filename
  const guessExt = (uri: string) => {
    const ext = uri.split("?")[0].split("#")[0].split(".").pop()?.toLowerCase();
    if (ext === "png") return { mime: "image/png", filename: "photo.png" };
    if (ext === "webp") return { mime: "image/webp", filename: "photo.webp" };
    if (ext === "jpg" || ext === "jpeg") return { mime: "image/jpeg", filename: "photo.jpg" };
    return { mime: "image/jpeg", filename: "photo.jpg" };
  };
  const { mime, filename } = guessExt(localUri);

  // Monta FormData do jeito que o React Native espera
  const form = new FormData();
  form.append("file", {
    uri: localUri,
    name: filename,
    type: mime
  } as any);

  console.log("POST ->", `${BASE_URL}/files/upload`);
  // Faz upload
  const resp = await fetch(`${BASE_URL}/files/upload`, {
    method: "POST",
    body: form,
    // NÃO definir headers 'Content-Type' manualmente
  }).catch(err => {
    console.error("fetch upload error:", err);
    throw new Error("Network request failed");
  });

  if (!resp.ok) {
    const t = await resp.text().catch(() => "");
    console.error("Upload response not ok:", resp.status, t);
    throw new Error(`Falha no upload (${resp.status}) ${t}`);
  }

  const json = await resp.json();
  // backend retorna { url: "/files/download/xxx" } -> precisa prefixar com BASE_URL
  const fullUrl = json.url?.startsWith("http") ? json.url : `${BASE_URL}${json.url}`;
  console.log("Upload OK ->", fullUrl);
  return fullUrl as string;
};

// CRUD Firestore (sem mudanças)
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
