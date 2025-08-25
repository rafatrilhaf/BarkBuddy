import { logOut, signIn, signUp } from "@/services/auth";
import { auth } from "@/services/firebase";
import React, { useState } from "react";

export default function TestAuth() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState("");

  const handleSignUp = async () => {
    try {
      await signUp(email, senha);
      setMsg("Usuário criado com sucesso!");
    } catch (e:any) {
      setMsg("Erro: " + e.message);
    }
  };

  const handleSignIn = async () => {
    try {
      await signIn(email, senha);
      setMsg("Login feito com sucesso!");
    } catch (e:any) {
      setMsg("Erro: " + e.message);
    }
  };

  const handleLogout = async () => {
    await logOut();
    setMsg("Deslogado.");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Teste Firebase Auth</h2>
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={e => setSenha(e.target.value)}
      />
      <button onClick={handleSignUp}>Cadastrar</button>
      <button onClick={handleSignIn}>Login</button>
      <button onClick={handleLogout}>Logout</button>
      <p>{msg}</p>
      <p>Usuário atual: {auth.currentUser?.email}</p>
    </div>
  );
}
