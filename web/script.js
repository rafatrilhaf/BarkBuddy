// Navbar automatizada: só aparece após clique no botão "Menu"
const navItems = [
  { label: 'SOBRE', href: 'index.html#sobre' },
  { label: 'EQUIPE', href: 'index.html#equipe' },
  { label: 'FAQ', href: 'index.html#faq' },
  { label: 'PLANOS', href: 'planos.html' },
  { label: 'ADQUIRA-JÁ', href: 'adquira.html', strong: true },
];

function buildNavbar() {
  const ul = document.getElementById('navMenu');
  if (!ul) return;
  ul.innerHTML = navItems.map(item => {
    const strongOpen = item.strong ? '<strong>' : '';
    const strongClose = item.strong ? '</strong>' : '';
    return `<li><a href="${item.href}">${strongOpen}${item.label}${strongClose}</a></li>`;
  }).join('');

  // Active state por página
  const links = ul.querySelectorAll('a');
  const here = location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    const file = (a.getAttribute('href')||'').split('#')[0];
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
document.querySelectorAll('.faq-item').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    btn.classList.toggle('active');
    const panel = btn.nextElementSibling;
    panel.classList.toggle('open');
  });
});

document.addEventListener('DOMContentLoaded', () => {
  buildNavbar();
  setupToggle();
});

// Checkout: mailto sem backend
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
