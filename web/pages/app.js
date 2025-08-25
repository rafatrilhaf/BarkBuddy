import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { doc, getDoc, getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// 🔐 SEUS dados do Firebase (e restrinja a API key por domínio .web.app no Console > Project settings)
const firebaseConfig = {
    apiKey: "AIzaSyArX5MuCavqggXgYkRGmfBpUjh8P6pVxMQ",
    authDomain: "barkbuddy-bd.firebaseapp.com",
    projectId: "barkbuddy-bd",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const landing = document.getElementById('landing');
const pet = document.getElementById('pet');

function firstPath() {
  const parts = location.pathname.split('/').filter(Boolean);
  return parts[0] || '';
}

async function ensureAnonLogin() {
  // se já estiver logado (inclusive anonimamente), segue
  if (auth.currentUser) return;
  await signInAnonymously(auth);
}

async function loadPet(id) {
  try {
    // ⚠️ LENDO DIRETO DE "pets" porque suas regras exigem usuário autenticado
    const ref = doc(db, 'pets', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      document.getElementById('petName').textContent = 'Pet não encontrado';
      document.getElementById('lastLocation').textContent = '—';
      return;
    }
    const p = snap.data();

    // Se você estiver salvando um bloco "public" dentro de pets, priorize ele:
    const pub = p.public || {};
    const name = p.name ?? pub.name;
    const species = p.species ?? pub.species;
    const breed = p.breed ?? pub.breed;
    const notes = p.notes ?? pub.notes;
    const photoUrl = p.photoUrl ?? pub.photoUrl;
    const tutorPhone = pub.tutorPhone ?? p.tutorPhone;
    const tutorEmail = pub.tutorEmail ?? p.tutorEmail;
    const last = pub.lastLocation ?? p.lastLocation;

    document.getElementById('petName').textContent = name || '(sem nome)';
    document.getElementById('petSpecies').textContent = [species, breed].filter(Boolean).join(' • ');
    document.getElementById('petNotes').textContent = notes || '';
    document.getElementById('petPhoto').src = photoUrl || 'https://placehold.co/160';
    document.getElementById('tutorContact').textContent = tutorPhone || tutorEmail || '—';

    document.getElementById('lastLocation').textContent =
      last ? `${last.lat?.toFixed?.(5)}, ${last.lng?.toFixed?.(5)} • ${new Date(last.ts).toLocaleString()}`
           : 'Sem dados.';

    const href = tutorPhone ? `https://wa.me/${String(tutorPhone).replace(/\D/g,'')}`
                            : (tutorEmail ? `mailto:${tutorEmail}` : '#');
    document.getElementById('notifyBtn').setAttribute('href', href);
  } catch (e) {
    console.error(e);
    document.getElementById('lastLocation').textContent = 'Erro ao carregar.';
  }
}

function start() {
  const id = firstPath();
  if (!id) { landing?.removeAttribute('hidden'); return; }
  pet?.removeAttribute('hidden');
  ensureAnonLogin().then(() => loadPet(id));
}

// Se preferir, pode esperar evento de auth também:
onAuthStateChanged(auth, () => start());
start();
