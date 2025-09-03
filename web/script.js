// =================== Navbar ===================
const navItems = [
  { label: 'INICIO', href: 'index.html' },
  { label: 'PERDIDOS', href: 'perdidos.html' },
  { label: 'PLANOS', href: 'planos.html' },
  { label: 'ADQUIRA-JÁ', href: 'adquira.html', strong: true },
  { label: 'PERFIL', href: 'perfil.html' }
];

function buildNavbar() {
  const ul = document.getElementById('navMenu');
  if (!ul) return;
  ul.innerHTML = navItems.map(item => {
    const strongOpen = item.strong ? '<strong>' : '';
    const strongClose = item.strong ? '</strong>' : '';
    return `<li><a href="${item.href}">${strongOpen}${item.label}${strongClose}</a></li>`;
  }).join('');

  const links = ul.querySelectorAll('a');
  const here = location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    const file = (a.getAttribute('href') || '').split('#')[0];
    if (file === here) a.classList.add('active');
  });
}

function setupToggle() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const open = menu.hasAttribute('hidden');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) menu.removeAttribute('hidden'); else menu.setAttribute('hidden', '');
    menu.classList.toggle('open', open);
  });
}

// Acordeão simples do FAQ
document.querySelectorAll('.faq-item').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    const panel = btn.nextElementSibling;
    panel.classList.toggle('open');
  });
});

document.addEventListener('DOMContentLoaded', () => {
  buildNavbar();
  setupToggle();
});

// =================== Checkout (mailto) ===================
const form = document.getElementById('checkoutForm');
if (form) {
  const cor = document.getElementById('cor');
  const corOutro = document.getElementById('corOutro');
  const corOutroLabel = document.getElementById('corOutroLabel');
  const okMsg = document.getElementById('okMsg');
  const errMsg = document.getElementById('errMsg');
  if (cor) cor.addEventListener('change', () => {
    const outra = cor.value === 'Outra';
    if (corOutro) corOutro.style.display = outra ? 'block' : 'none';
    if (corOutroLabel) corOutroLabel.style.display = outra ? 'block' : 'none';
    if (!outra && corOutro) corOutro.value = '';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      if (errMsg) errMsg.style.display = 'block';
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    const to = 'barkbuddy@tec.com';
    const subject = encodeURIComponent('[Pedido] Coleira BarkBuddy');
    const body = encodeURIComponent(
      `Olá, BarkBuddy!\n\nQuero adquirir uma coleira. Seguem meus dados:\n\n` +
      `Nome: ${data.nome}\nE-mail: ${data.email}\nTelefone: ${data.telefone}\n` +
      `Nome do pet: ${data.petNome}\nTamanho da coleira: ${data.tamanho}\n` +
      `Cor: ${data.cor}${data.cor === 'Outra' && data.corOutro ? ' (' + data.corOutro + ')' : ''}\n` +
      `Endereço para entrega:\n${data.endereco}\n\nAguardo retorno.`
    );
    if (okMsg) okMsg.style.display = 'block';
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    form.reset();
    if (corOutro) corOutro.style.display = 'none';
    if (corOutroLabel) corOutroLabel.style.display = 'none';
  });
}

// =================== Firebase / Firestore / Auth (CDN) ===================
import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  addDoc, collection, doc, getDoc, getDocs, getFirestore,
  query, serverTimestamp, where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyArX5MuCavqggXgYkRGmfBpUjh8P6pVxMQ",
  authDomain: "barkbuddy-bd.firebaseapp.com",
  projectId: "barkbuddy-bd",
  storageBucket: "barkbuddy-bd.appspot.com",
  messagingSenderId: "41034629472",
  appId: "1:41034629472:web:5b975afff21197bedb5e05",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db  = getFirestore(app);
const auth = getAuth(app);

// =================== Lista: Pets Perdidos (perdidos.html) ===================
async function carregarPets() {
  const grid = document.getElementById("petsGrid");
  if (!grid) return;

  grid.innerHTML = `<div class="loading">Carregando pets perdidos…</div>`;

  try {
    // Query pets perdidos
    const q = query(collection(db, "pets"), where("lost", "==", true));
    const snap = await getDocs(q);

    grid.innerHTML = "";
    if (snap.empty) {
      grid.innerHTML = `<p>Nenhum pet perdido no momento.</p>`;
      return;
    }

    // Itera pelos documentos
    for (const d of snap.docs) {
      const pet = { id: d.id, ...d.data() };

      // 1️⃣ Pega a imagem cadastrada, ou default
      const imgSrc = pet.photoUrl || "assets/ai/dog_sample.jpg";

      const name = pet.name || "Pet perdido";
      const breed = pet.breed || "Sem raça definida";
      const species = pet.species || "Pet";
      const city = pet.city || pet.lastSeenCity || "";
      const state = pet.state || pet.lastSeenState || "";

      // link para detalhes
      const link = `detalhes.html?petId=${encodeURIComponent(pet.id)}`;

      // cria card
      const card = document.createElement("article");
      card.classList.add("pet-card");
      card.innerHTML = `
  <a href="${link}" class="thumb" aria-label="Abrir detalhes de ${name}">
    <img src="${imgSrc}" alt="${name}">
    <span class="badge">Perdido</span>
  </a>

  <h3><a href="${link}">${name}</a></h3>
  <p>
    ${breed} • ${species}
    ${city || state ? ` • ${city}${state ? " - " + state : ""}` : ""}
  </p>

  <a class="btn btn-primary" href="${link}">Ver detalhes</a>
`;

      grid.appendChild(card);
    }
  } catch (err) {
    console.error("[Pets Perdidos] erro:", err);
    grid.innerHTML = `<p>Não foi possível carregar os pets agora.</p>`;
  }
}


// =================== Detalhes do Pet (detalhes.html) ===================
function getQS(name) {
  return new URLSearchParams(location.search).get(name);
}
function formatDate(ts) {
  try {
    if (!ts) return '';
    if (typeof ts.toDate === 'function') return ts.toDate().toLocaleString();
    if (typeof ts.seconds === 'number') return new Date(ts.seconds * 1000).toLocaleString();
  } catch {}
  return '';
}

async function carregarDetalhesPet() {
  const elNome = document.getElementById("petNome");
  if (!elNome) return;

  const elFoto = document.getElementById("petFoto");
  const elInfo = document.getElementById("petInfo");
  const elLocal = document.getElementById("petLocal");
  const btnContato = document.getElementById("btnContato");

  const petId = getQS('petId');
  if (!petId) {
    elNome.textContent = "Pet não encontrado (ID ausente).";
    if (elFoto) elFoto.style.display = "none";
    return;
  }

  try {
    const snap = await getDoc(doc(db, "pets", petId));
    if (!snap.exists()) {
      elNome.textContent = "Pet não encontrado.";
      if (elFoto) elFoto.style.display = "none";
      return;
    }

    const p = snap.data();
    const name    = p.name || "Pet";
    const imgSrc  = p.photoUrl || "assets/ai/dog_sample.jpg";
    const breed   = p.breed || "Sem raça definida";
    const species = p.species || "Pet";
    const age     = (p.age ?? "") !== "" ? p.age : "";
    const info    = [breed, species, (age !== "" ? `${age} ${age == 1 ? 'ano' : 'anos'}` : "")]
                      .filter(Boolean).join(" • ");

    const city = p.city || p.lastSeenCity || "";
    const state = p.state || p.lastSeenState || "";
    const when = formatDate(p.lastSeenAt);
    const localFmt = [city && state ? `${city} - ${state}` : (city || state || "—"),
                      when ? `(${when})` : ""].filter(Boolean).join(" ");

    elNome.textContent = name;
    if (elFoto) { elFoto.src = imgSrc; elFoto.alt = name; }
    if (elInfo) elInfo.textContent = info || "Sem informações adicionais";
    if (elLocal) elLocal.textContent = localFmt;

    if (btnContato) {
      btnContato.addEventListener('click', (e) => {
        e.preventDefault();
        openContactModal({ ownerUid: p.userId, petId, petName: name });
      });
    }
  } catch (e) {
    console.error("[Detalhes] erro:", e);
    elNome.textContent = "Não foi possível carregar o pet.";
    if (elFoto) elFoto.style.display = "none";
  }
}

// =================== Modal de contato ===================
(function injectContactStyles(){
  if (document.getElementById('contactModalStyles')) return;
  const css = `
  .bb-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9998}
  .bb-modal{background:#fff;border-radius:14px;max-width:720px;width:92%;padding:20px;box-shadow:0 14px 40px rgba(0,0,0,.2);font-family:Montserrat,system-ui;color:#0d3b2a}
  .bb-modal h2{margin:0 0 12px 0;font-size:1.6rem;color:#0c6b41}
  .bb-contact{background:#f8fcf9;border:1px solid #cfe0d1;border-radius:12px;padding:12px 14px;margin:8px 0 14px}
  .bb-contact p{margin:6px 0}
  .bb-contact a{color:#0c6b41;font-weight:700;text-decoration:none}
  .bb-contact a:hover{text-decoration:underline}
  .bb-modal h3{margin:8px 0 8px;font-size:1.05rem}
  .bb-modal form{display:grid;gap:10px}
  .bb-input{width:100%;border:1px solid #cfe0d1;border-radius:10px;padding:12px 14px;background:#f8fcf9}
  .bb-row{display:grid;gap:10px;grid-template-columns:1fr 1fr}
  .bb-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:8px}
  .bb-btn{border:0;border-radius:10px;padding:12px 16px;cursor:pointer;font-weight:700}
  .bb-btn-primary{background:#0c6b41;color:#fff}
  .bb-btn-ghost{background:#eaf5ec;color:#0c6b41}
  .bb-success{color:#0c6b41;margin-top:8px}
  .bb-error{color:#b00020;margin-top:8px}
  `;
  const style = document.createElement('style');
  style.id = 'contactModalStyles';
  style.textContent = css;
  document.head.appendChild(style);
})();

async function openContactModal({ ownerUid, petId, petName }) {
  // fecha modais antigos (se existirem)
  document.querySelectorAll('.bb-overlay').forEach(el => el.remove());

  const overlay = document.createElement('div');
  overlay.className = 'bb-overlay';
  overlay.innerHTML = `
    <div class="bb-modal" role="dialog" aria-modal="true" aria-label="Entrar em contato">
      <h2>Entrar em contato sobre <strong>${petName}</strong></h2>

      <div id="bbTutor" class="bb-contact"><p>Carregando contato do tutor…</p></div>

      <h3>Ou envie um recado</h3>
      <form id="bbContactForm">
        <input class="bb-input" type="text" name="visitorName" placeholder="Seu nome" required />
        <div class="bb-row">
          <input class="bb-input" type="tel"   name="visitorPhone" placeholder="Seu WhatsApp (apenas números)" />
          <input class="bb-input" type="email" name="visitorEmail" placeholder="Seu e-mail" />
        </div>
        <textarea class="bb-input" name="message" rows="4" placeholder="Sua mensagem (ex.: vi o pet no bairro X...)" required></textarea>
        <div class="bb-actions">
          <button type="button" class="bb-btn bb-btn-ghost" id="bbCancel">Cancelar</button>
          <button type="submit" class="bb-btn bb-btn-primary">Enviar</button>
        </div>
        <div class="bb-success" id="bbOk"  style="display:none">Mensagem enviada! O tutor será avisado.</div>
        <div class="bb-error"   id="bbErr" style="display:none">Não foi possível enviar. Tente novamente.</div>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  // travar scroll
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  // helpers de fechar
  const close = () => {
    overlay.remove();
    document.body.style.overflow = prevOverflow;
    document.removeEventListener('keydown', onEsc);
  };
  const onEsc = (ev) => { if (ev.key === 'Escape') close(); };
  document.addEventListener('keydown', onEsc);
  overlay.addEventListener('click', (ev) => { if (ev.target === overlay) close(); });

  const tutorBox = overlay.querySelector('#bbTutor');
  const form = overlay.querySelector('#bbContactForm');
  const btnCancel = overlay.querySelector('#bbCancel');
  const ok = overlay.querySelector('#bbOk');
  const err = overlay.querySelector('#bbErr');

  btnCancel.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); close(); });

  // contato público do tutor
  try {
    let html = `<p>Contato não disponível.</p>`;
    if (ownerUid) {
      const s = await getDoc(doc(db, "usersPublic", ownerUid));
      if (s.exists()) {
        const u = s.data();
        const email = u.emailPublic || u.email || "";
        const raw   = (u.phonePublic || u.phone || "").toString();
        const digits = raw.replace(/\D/g, "");
        const wa = digits ? (digits.startsWith("55") ? digits : "55" + digits) : "";

        html = `
          <p><strong>E-mail:</strong> ${ email ? `<a href="mailto:${email}">${email}</a>` : "—" }</p>
          <p><strong>WhatsApp:</strong> ${ wa ? `<a href="https://wa.me/${wa}" target="_blank" rel="noopener">+${wa}</a>` : "—" }</p>
        `;
      }
    }
    tutorBox.innerHTML = html;
  } catch (e) {
    console.error("[Contato público] erro:", e);
    tutorBox.innerHTML = `<p>Contato não disponível.</p>`;
  }

  // prefill visitante (se logado)
  const nameInput  = overlay.querySelector('input[name="visitorName"]');
  const emailInput = overlay.querySelector('input[name="visitorEmail"]');
  const fillFromUser = (user) => {
    if (!user) return;
    if (user.displayName && !nameInput.value)  nameInput.value  = user.displayName;
    if (user.email && !emailInput.value)       emailInput.value = user.email;
  };
  fillFromUser(auth?.currentUser);
  onAuthStateChanged(auth, fillFromUser);

  // envio opcional para contactRequests
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.style.display = 'none'; ok.style.display = 'none';

    const data = Object.fromEntries(new FormData(form).entries());
    const payload = {
      ownerUid: ownerUid || null,
      petId, petName,
      visitorName:  (data.visitorName || '').toString().trim(),
      visitorPhone: (data.visitorPhone || '').toString().replace(/\D/g,''),
      visitorEmail: (data.visitorEmail || '').toString().trim(),
      message:      (data.message || '').toString().trim(),
      status: 'new',
      source: 'web',
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'contactRequests'), payload);
      ok.style.display = 'block';
      setTimeout(close, 1200);
    } catch (e) {
      console.error('[Contato] erro ao salvar:', e);
      err.style.display = 'block';
    }
  });
}

// =================== Bootstrap ===================
document.addEventListener("DOMContentLoaded", () => {
  carregarPets();        // só roda em perdidos.html
  carregarDetalhesPet(); // só roda em detalhes.html
});
