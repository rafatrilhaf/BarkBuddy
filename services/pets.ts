// services/pets.ts
import {
  addDoc, collection,
  deleteDoc, doc, getDocs, onSnapshot, query,
  serverTimestamp,
  setDoc // ⬅️ add setDoc
  ,

  updateDoc, where
} from "firebase/firestore";
import { db } from "./firebase";

export type Pet = {
  name: string;
  userId: string;        // dono do pet (auth.uid)
  species?: string;
  breed?: string;
  age?: number;
  notes?: string;
  lost?: boolean;
  photoUrl?: string;     // ⬅️ se tiver foto
  // campos que você quer que possam ir pra versão pública:
  public?: {
    tutorPhone?: string;
    tutorEmail?: string;
    lastLocation?: { lat:number; lng:number; ts:number };
  };
  createdAt?: any;
  updatedAt?: any;
};

const col = collection(db, "pets");

// 👇 converte dados do pet -> somente campos liberados para o público
const toPublic = (p: Partial<Pet>) => ({
  name: p.name ?? null,
  species: p.species ?? null,
  breed: p.breed ?? null,
  notes: p.notes ?? null,
  photoUrl: p.photoUrl ?? null,
  tutorPhone: p.public?.tutorPhone ?? (p as any)?.tutorPhone ?? null,
  tutorEmail: p.public?.tutorEmail ?? (p as any)?.tutorEmail ?? null,
  lastLocation: p.public?.lastLocation ?? (p as any)?.lastLocation ?? null,
});

// CREATE
export const addPet = async (pet: Pet) => {
  const ref = await addDoc(col, {
    ...pet,
    lost: pet.lost ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  // espelha público
  await setDoc(doc(db, "pets_public", ref.id), toPublic(pet), { merge: true });
  return ref.id;
};

// UPDATE
export const updatePet = async (id: string, patch: Partial<Pet>) => {
  await updateDoc(doc(db, "pets", id), { ...patch, updatedAt: serverTimestamp() });
  // atualiza espelho público (merge preserva o que já existe)
  await setDoc(doc(db, "pets_public", id), toPublic(patch), { merge: true });
};

// DELETE
export const deletePetById = async (id: string) => {
  await deleteDoc(doc(db, "pets", id));
  await deleteDoc(doc(db, "pets_public", id)); // remove a página pública também
};

// READS
export const getMyPets = async (userId: string) => {
  const q = query(col, where("userId", "==", userId));
  const ss = await getDocs(q);
  return ss.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
};

export const subscribeMyPets = (userId: string, cb: (pets: any[]) => void) => {
  const q = query(col, where("userId", "==", userId));
  return onSnapshot(q, (ss) => {
    cb(ss.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};
