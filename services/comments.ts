import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { getUser } from "./users";

export type Comment = {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoUrl?: string | null;
  text: string;
  createdAt: Timestamp;
  parentId?: string | null; // null = comentário principal, string = reply
  replies?: Comment[]; // Para organizar replies aninhados
};

// Adicionar comentário ou reply
export async function addComment(postId: string, text: string, parentId: string | null = null) {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");

  // Buscar dados do usuário para incluir foto
  const userProfile = await getUser(user.uid);

  const commentsCol = collection(db, "posts", postId, "comments");

  await addDoc(commentsCol, {
    authorId: user.uid,
    authorName: userProfile?.name || user.displayName || user.email || "Tutor",
    authorPhotoUrl: userProfile?.photoUrl || null,
    text: text.trim(),
    createdAt: serverTimestamp(),
    parentId: parentId,
  });
}

// Escutar comentários em tempo real e organizar com replies
export function subscribeComments(postId: string, callback: (comments: Comment[]) => void) {
  const commentsCol = collection(db, "posts", postId, "comments");
  const q = query(commentsCol, orderBy("createdAt", "asc"));
  
  return onSnapshot(q, (snapshot) => {
    const allComments: Comment[] = [];
    snapshot.forEach(doc => {
      allComments.push({ id: doc.id, ...doc.data() } as Comment);
    });

    // Organizar comentários principais e replies
    const mainComments = allComments.filter(c => !c.parentId);
    const replies = allComments.filter(c => c.parentId);

    // Adicionar replies aos comentários principais
    const organizedComments = mainComments.map(comment => ({
      ...comment,
      replies: replies.filter(reply => reply.parentId === comment.id)
    }));

    callback(organizedComments);
  });
}
