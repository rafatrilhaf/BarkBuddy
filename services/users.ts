import * as ImageManipulator from "expo-image-manipulator";
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { Platform } from "react-native";
import { db } from "./firebase";

export type UserProfile = {
  name?: string;
  phone?: string;
  address?: string;
  email?: string;
  photoUrl?: string;
  updatedAt?: any;
};

// 🔧 Configura BASE_URL para qualquer dispositivo na mesma rede
const BASE_URL =
  Platform.OS === "android"
    ? "http://192.168.1.185:8080" // ⚠️ Coloque o IP da sua máquina
    : "http://192.168.1.185:8080";

export async function uploadUserPhoto(uri: string) {
  // Compressão simples
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
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
}

// CRUD Firestore
export const getUser = async (uid: string) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserProfile) : null;
};

export const setUser = async (uid: string, payload: UserProfile) => {
  const ref = doc(db, "users", uid);
  await setDoc(ref, payload, { merge: true });
};

export const updateUser = async (uid: string, patch: Partial<UserProfile>) => {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { ...patch, updatedAt: new Date() });
};

export const subscribeUser = (uid: string, cb: (u: UserProfile | null) => void) => {
  const ref = doc(db, "users", uid);
  return onSnapshot(ref, (snap) => {
    cb(snap.exists() ? (snap.data() as UserProfile) : null);
  });
};
