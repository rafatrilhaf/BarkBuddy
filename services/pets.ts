// src/services/pets.ts
import {
    addDoc, collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    query,
    serverTimestamp,
    updateDoc,
    where
} from "firebase/firestore";
import { db } from "./firebase";

export type Pet = {
  name: string;
  userId: string;
  species?: string;   // cão, gato...
  breed?: string;
  age?: number;
  notes?: string;
  lost?: boolean;
  createdAt?: any;
  updatedAt?: any;
};

const col = collection(db, "pets");

export const addPet = (pet: Pet) =>
  addDoc(col, { ...pet, lost: pet.lost ?? false, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

export const updatePet = (id: string, patch: Partial<Pet>) =>
  updateDoc(doc(db, "pets", id), { ...patch, updatedAt: serverTimestamp() });

export const deletePetById = (id: string) =>
  deleteDoc(doc(db, "pets", id));

export const getMyPets = async (userId: string) => {
  const q = query(col, where("userId", "==", userId));
  const ss = await getDocs(q);
  return ss.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
};

// live updates
export const subscribeMyPets = (userId: string, cb: (pets: any[]) => void) => {
  const q = query(col, where("userId", "==", userId));
  return onSnapshot(q, (ss) => {
    cb(ss.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};
