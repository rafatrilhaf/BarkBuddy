// services/post.ts
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
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
  likes: number;
};

export type Comment = {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: Timestamp;
  parentId?: string | null; // Para respostas a comentários
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
    likes: 0,
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
        likes: data.likes ?? 0,
      });
    });
    onChange(list);
  });
}

// ✅ CORRIGIDO: Like apenas incrementa o campo likes (sem updatedAtTS)
export async function likePost(postId: string) {
  await updateDoc(doc(db, "posts", postId), {
    likes: increment(1), // SÓ O CAMPO LIKES!
  });
}

// ✅ NOVO: Sistema de comentários completo
export async function addComment(postId: string, text: string, parentId?: string | null) {
  const user = auth.currentUser;
  if (!user) throw new Error("Precisa estar logado para comentar.");

  const userDoc = await getUser(user.uid);
  const commentsCol = collection(db, "posts", postId, "comments");

  await addDoc(commentsCol, {
    authorId: user.uid,
    authorName: userDoc?.name || user.displayName || user.email || "Usuário",
    text: text.trim(),
    createdAt: serverTimestamp(),
    parentId: parentId || null,
  });
}

// ✅ NOVO: Buscar comentários de um post
export async function getPostComments(postId: string): Promise<Comment[]> {
  const commentsCol = collection(db, "posts", postId, "comments");
  const q = query(commentsCol, orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);
  
  const comments: Comment[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    comments.push({
      id: doc.id,
      authorId: data.authorId,
      authorName: data.authorName,
      text: data.text,
      createdAt: data.createdAt,
      parentId: data.parentId || null,
    });
  });
  
  return comments;
}

// Excluir post
export async function deleteMyPost(postId: string) {
  await deleteDoc(doc(db, "posts", postId));
}