import {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { auth } from "./firebase";

export const signIn = (email: string, senha: string) =>
  signInWithEmailAndPassword(auth, email, senha);

export const signUp = (email: string, senha: string) =>
  createUserWithEmailAndPassword(auth, email, senha);

export const resetPassword = (email: string) =>
  sendPasswordResetEmail(auth, email);

export const logOut = () => signOut(auth);
