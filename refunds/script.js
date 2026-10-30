// Highlight the nav link for the section currently in view
const links = document.querySelectorAll('.toc a');
const sections = [...document.querySelectorAll('main section')];

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
    }
  });
}, { rootMargin: '-30% 0px -60% 0px' });
sections.forEach((s) => observer.observe(s));

// Acknowledgement checkbox enables the button
const box = document.getElementById('ackBox');
const btn = document.getElementById('ackBtn');
const msg = document.getElementById('ackMsg');
box.addEventListener('change', () => {
  btn.disabled = !box.checked;
  msg.textContent = '';
});

document.getElementById('ackForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!box.checked) return;
  msg.textContent = 'Thanks. Policy acknowledged.';
  // Replace with your real next step, e.g. window.location.href = '/checkout';
});
