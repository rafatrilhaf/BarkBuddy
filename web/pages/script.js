// Acordeão simples do FAQ
document.querySelectorAll('.faq-item').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    btn.classList.toggle('active');
    const panel = btn.nextElementSibling;
    panel.classList.toggle('open');
  });
});