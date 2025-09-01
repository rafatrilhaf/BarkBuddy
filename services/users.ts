// src/services/users.ts
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
