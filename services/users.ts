// src/services/users.ts
import * as ImageManipulator from 'expo-image-manipulator';
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export type UserProfile = {
  name?: string;
  phone?: string;
  address?: string;
  email?: string;
  photoUrl?: string;
  updatedAt?: any;
};

// ---------------- compressão + upload ----------------
const BASE_URL = "http://10.0.2.2:8080";

export async function uploadUserPhoto(uri: string) {
  const manipResult = await ImageManipulator.manipulateAsync(uri, [
    { resize: { width: 1024 } }
  ], { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG });

  const filename = "photo.jpg";
  const mime = "image/jpeg";

  const form = new FormData();
  form.append("file", { uri: manipResult.uri, name: filename, type: mime } as any);

  const resp = await fetch(`${BASE_URL}/files/upload`, { method: "POST", body: form });
  if (!resp.ok) throw new Error(`Falha no upload (${resp.status})`);
  const json = await resp.json();
  return json.url?.startsWith("http") ? json.url : `${BASE_URL}${json.url}`;
}

/**
 * Retorna o documento do usuário (uma vez).
 */
export const getUser = async (uid: string) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserProfile) : null;
};

/**
 * Cria ou substitui (merge=false). Use com cuidado.
 */
export const setUser = async (uid: string, payload: UserProfile) => {
  const ref = doc(db, "users", uid);
  await setDoc(ref, payload, { merge: true });
};

/**
 * Atualiza campos do usuário (merge).
 */
export const updateUser = async (uid: string, patch: Partial<UserProfile>) => {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    ...patch,
    updatedAt: new Date()
  });
};

/**
 * Subscribe para mudanças em tempo real no doc do usuário.
 * Retorna a função de unsubscribe.
 */
export const subscribeUser = (uid: string, cb: (u: UserProfile | null) => void) => {
  const ref = doc(db, "users", uid);
  return onSnapshot(ref, (snap) => {
    cb(snap.exists() ? (snap.data() as UserProfile) : null);
  });
};
