// perfil.js (email/senha)
import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getAuth, onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  deleteDoc,
  doc, getDoc,
  getFirestore,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Config Firebase (mesma do projeto)
const firebaseConfig = {
  apiKey: "AIzaSyArX5MuCavqggXgYkRGmfBpUjh8P6pVxMQ",
  authDomain: "barkbuddy-bd.firebaseapp.com",
  projectId: "barkbuddy-bd",
  storageBucket: "barkbuddy-bd.appspot.com",
  messagingSenderId: "41034629472",
  appId: "1:41034629472:web:5b975afff21197bedb5e05",
};

// Evita app duplicado
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db  = getFirestore(app);
const auth = getAuth(app);

// UI
const authBox = document.getElementById('authBox');
const authEmail = document.getElementById('authEmail');
const authPass  = document.getElementById('authPass');
const btnSignup = document.getElementById('btnSignup');
const btnLogin  = document.getElementById('btnLogin');
const authErr   = document.getElementById('authErr');

const formEl  = document.getElementById('perfilForm');
const okEl    = document.getElementById('ok');
const errEl   = document.getElementById('err');
const nameEl  = document.getElementById('name');
const emailEl = document.getElementById('email');
const phoneEl = document.getElementById('phone');
const shareEl = document.getElementById('shareContact');
const logoutBtn = document.getElementById('logout');

// Helpers
function showAuthError(msg) {
  authErr.textContent = msg;
  authErr.style.display = 'block';
}

// Ações de autenticação (email/senha)
if (btnSignup) btnSignup.addEventListener('click', async () => {
  authErr.style.display = 'none';
  try {
    await createUserWithEmailAndPassword(auth, authEmail.value.trim(), authPass.value);
  } catch (e) {
    console.error(e);
    showAuthError(e.message || 'Falha ao criar conta.');
  }
});

if (btnLogin) btnLogin.addEventListener('click', async () => {
  authErr.style.display = 'none';
  try {
    await signInWithEmailAndPassword(auth, authEmail.value.trim(), authPass.value);
  } catch (e) {
    console.error(e);
    showAuthError('Não foi possível entrar. Verifique e-mail/senha.');
  }
});

if (logoutBtn) logoutBtn.addEventListener('click', () => signOut(auth));

// Carrega perfil ao logar
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    authBox.style.display = 'block';
    formEl.style.display  = 'none';
    return;
  }
  authBox.style.display = 'none';
  formEl.style.display  = 'block';

  try {
    const usnap = await getDoc(doc(db, "users", user.uid));
    if (usnap.exists()) {
      const u = usnap.data();
      nameEl.value   = u.name || '';
      emailEl.value  = u.email || '';
      phoneEl.value  = (u.phone || '').toString().replace(/\D/g,'');
      shareEl.checked = !!(u.shareContact === true);
    } else {
      // prefill básico
      nameEl.value   = '';
      emailEl.value  = user.email || '';
      phoneEl.value  = '';
      shareEl.checked = false;
    }
  } catch (e) {
    console.error("[perfil] erro carregando user:", e);
  }
});

// Salvar perfil + espelho público
if (formEl) formEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  okEl.style.display = 'none'; errEl.style.display = 'none';
  const user = auth.currentUser; if (!user) return;

  const data = {
    name:  nameEl.value.trim(),
    email: emailEl.value.trim(),
    phone: phoneEl.value.replace(/\D/g,''),
    shareContact: !!shareEl.checked
  };

  try {
    // 1) perfil privado
    await setDoc(doc(db, "users", user.uid), data, { merge: true });

    // 2) contato público (somente se opt-in)
    if (data.shareContact) {
      await setDoc(doc(db, "usersPublic", user.uid), {
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        updatedAt: new Date()
      }, { merge: true });
    } else {
      await deleteDoc(doc(db, "usersPublic", user.uid)).catch(()=>{});
    }

    okEl.style.display = 'block';
    setTimeout(()=> okEl.style.display='none', 1500);
  } catch (e) {
    console.error("[perfil] erro ao salvar:", e);
    errEl.style.display = 'block';
  }
});
