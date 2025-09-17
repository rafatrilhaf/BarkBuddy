// services/post.ts
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { getUser } from "./users";

export type TextPost = {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoUrl?: string | null;
  text: string;
  createdAtTS: Timestamp;
  updatedAtTS: Timestamp;
};

// Referência para a coleção de posts
const postsCol = collection(db, "posts");

// Criar post (incluindo authorPhotoUrl)
export async function publishTextPost(text: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Precisa estar logado.");

  // Buscar dados completos do usuário para pegar a foto
  const userDoc = await getUser(user.uid);

  await addDoc(postsCol, {
    authorId: user.uid,
    authorName: userDoc?.name || user.displayName || user.email || "Tutor",
    authorPhotoUrl: userDoc?.photoUrl || null,
    text: text.trim(),
    createdAtTS: serverTimestamp(),
    updatedAtTS: serverTimestamp(),
  });
}

// Ouvir posts em tempo real
export function listenTextPosts(onChange: (items: TextPost[]) => void) {
  const q = query(postsCol, orderBy("createdAtTS", "desc"));
  return onSnapshot(q, (snap) => {
    const list: TextPost[] = [];
    snap.forEach((d) => {
      const data = d.data() as any;
      list.push({
        id: d.id,
        authorId: data.authorId,
        authorName: data.authorName,
        authorPhotoUrl: data.authorPhotoUrl || null,
        text: data.text,
        createdAtTS: data.createdAtTS,
        updatedAtTS: data.updatedAtTS,
      });
    });
    onChange(list);
  });
}

// Excluir post
export async function deleteMyPost(postId: string) {
  await deleteDoc(doc(db, "posts", postId));
}
