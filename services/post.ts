// services/posts.ts
import {
    addDoc, collection,
    deleteDoc,
    doc,
    increment,
    onSnapshot, orderBy, query,
    serverTimestamp,
    Timestamp,
    updateDoc
} from "firebase/firestore";
import { auth, db } from "./firebase";

export type TextPost = {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAtTS: Timestamp;   // <- timestamp exigido nas regras
  updatedAtTS: Timestamp;   // <- timestamp exigido nas regras
  likes: number;            // <- number exigido nas regras
};

const postsCol = collection(db, "posts");

// Criar post (somente chaves permitidas pelas regras)
export async function publishTextPost(text: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Precisa estar logado.");

  await addDoc(postsCol, {
    authorId: user.uid,
    authorName: user.displayName || user.email || "Tutor",
    text: text.trim(),
    createdAtTS: serverTimestamp(),
    updatedAtTS: serverTimestamp(),
    likes: 0,
  });
}

// Ouvir posts em tempo real (ordenado por criação desc)
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
        text: data.text,
        createdAtTS: data.createdAtTS,
        updatedAtTS: data.updatedAtTS,
        likes: data.likes ?? 0,
      });
    });
    onChange(list);
  });
}

// Like com segurança (increment no servidor)
export async function likePost(postId: string) {
  await updateDoc(doc(db, "posts", postId), {
    likes: increment(1),
    updatedAtTS: serverTimestamp(),
  });
}

// Excluir (as regras garantem que só o autor consegue)
export async function deleteMyPost(postId: string) {
  await deleteDoc(doc(db, "posts", postId));
}
