'use strict';
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  if (!menuButton || !navigation) return;
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('span').textContent = '+';
}
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
  menuButton.querySelector('span').textContent = open ? '−' : '+';
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation?.classList.contains('open')) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header')) closeMenu();
});
navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
window.matchMedia('(min-width: 651px)').addEventListener('change', closeMenu);
document.querySelectorAll('[data-year]').forEach(node => node.textContent = new Date().getFullYear());
const copyButton = document.querySelector('.copy-email');
copyButton?.addEventListener('click', async () => {
  const status = document.querySelector('.copy-status');
  status.textContent = 'Copying email address…';
  try {
    await Promise.race([
      navigator.clipboard.writeText('shahmanavamit@gmail.com'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Clipboard unavailable')), 1500))
    ]);
    status.textContent = 'Email address copied.';
  } catch {
    status.textContent = 'Please select and copy the email address above.';
  }
});
const clock = document.querySelector('#mumbai-time');
if (clock) {
  const updateClock = () => {
    clock.textContent = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date()) + ' IST';
    clock.dateTime = new Date().toISOString();
  };
  updateClock();
  setInterval(updateClock, 60000);
}
const dialog = document.querySelector('#certificate-dialog');
if (dialog && typeof dialog.showModal === 'function') {
  document.querySelectorAll('[data-certificate]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const image = document.querySelector('#certificate-image');
      image.src = link.dataset.certificate;
      image.alt = link.dataset.title;
      document.querySelector('#certificate-title').textContent = link.dataset.title;
      document.querySelector('#certificate-original').href = link.href;
      dialog.showModal();
      document.body.classList.add('modal-open');
    });
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }});
  dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
}

// Keep navigation and the progress indicator in sync with the visible section.
const progress = document.querySelector('.reading-progress');
const sectionLinks = [...document.querySelectorAll('.one-page [data-section]')];
const portfolioSections = sectionLinks.map(link => document.getElementById(link.dataset.section)).filter(Boolean);
let scrollQueued = false;
function updateScrollPosition() {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.transform = `scaleX(${available > 0 ? Math.min(1, Math.max(0, window.scrollY / available)) : 0})`;
  let current = '';
  for (const section of portfolioSections) {
    if (section.getBoundingClientRect().top <= 150) current = section.id;
  }
  for (const link of sectionLinks) {
    if (link.dataset.section === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  scrollQueued = false;
}
function queueScrollUpdate() {
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScrollPosition); }
}
window.addEventListener('scroll', queueScrollUpdate, { passive: true });
window.addEventListener('resize', queueScrollUpdate);
window.addEventListener('load', updateScrollPosition);
document.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', queueScrollUpdate));
updateScrollPosition();

const projectPreviews = {
 save: { title: 'When every second counts.', description: 'An ambulance-routing simulation built with Dijkstra’s algorithm and custom data structures.', tech: 'C++ / GRAPH ROUTING', href: '#project-save', label: 'Explore S.A.V.E. ↗', path: 'M28 78H68V48H108V20H148' },
 rag: { title: 'An answer needs evidence.', description: 'Hybrid retrieval and claim-level checks connect generated answers to their source documents.', tech: 'PYTHON / RAG / FAISS', href: '#project-rag', label: 'Explore the citation system ↗', path: 'M28 78V48H108V20H148' },
 mumbai: { title: 'A city that keeps moving.', description: 'A 50-vehicle logistics simulation exploring dispatch, traffic-aware routing, and fleet coordination.', tech: 'PYTHON / FLEET SIMULATION', href: '#mumbai-project', label: 'Explore Mumbai Pravaas ↗', path: 'M28 78H108V48H68V20H148' }
};
document.querySelectorAll('[data-preview]').forEach(button => button.addEventListener('click', () => {
 const preview = projectPreviews[button.dataset.preview];
 document.querySelectorAll('[data-preview]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
 document.getElementById('sampler-title').textContent = preview.title;
 document.getElementById('sampler-description').textContent = preview.description;
 document.getElementById('sampler-tech').textContent = preview.tech;
 const link = document.getElementById('sampler-link'); link.href = preview.href; link.textContent = preview.label;
 document.querySelector('.sampler-diagram .map-route').setAttribute('d', preview.path);
}));
document.getElementById('sampler-link')?.addEventListener('click', event => {
 const target = document.querySelector(event.currentTarget.hash);
 if (target?.tagName === 'DETAILS') target.open = true;
});

// A small deterministic Dijkstra demonstration; all weights are illustrative.
const labRoads = [ ['A','B',3], ['B','C',2], ['C','F',4], ['A','D',4], ['D','E',2], ['E','F',3], ['B','E',2] ];
const closedRoads = new Set();
function calculateRoute(blocked) {
 const costs = { A:0, B:Infinity, C:Infinity, D:Infinity, E:Infinity, F:Infinity };
 const previous = {}; const remaining = new Set(Object.keys(costs));
 while (remaining.size) {
  const current = [...remaining].sort((a,b) => costs[a]-costs[b])[0];
  if (!Number.isFinite(costs[current])) break;
  remaining.delete(current);
  if (current === 'F') break;
  for (const [a,b,weight] of labRoads) {
   if (blocked.has(a+b)) continue;
   const next = a === current ? b : b === current ? a : null;
   if (next && remaining.has(next) && costs[current]+weight < costs[next]) {
    costs[next] = costs[current]+weight; previous[next] = current;
   }
  }
 }
 if (!Number.isFinite(costs.F)) return {path:[],cost:null};
 const path=['F']; while(path[0] !== 'A') path.unshift(previous[path[0]]);
 return {path,cost:costs.F};
}
function renderRouteLab() {
 const result = calculateRoute(closedRoads);
 document.querySelectorAll('[data-road]').forEach(edge => {
  const [a,b] = edge.dataset.road;
  const selected = result.path.some((node,i) => i < result.path.length-1 && ((node===a && result.path[i+1]===b)||(node===b && result.path[i+1]===a)));
  edge.classList.toggle('is-route',selected);
  edge.classList.toggle('is-blocked',closedRoads.has(a+b));
 });
 document.querySelectorAll('[data-block]').forEach(button => {
  const blocked=closedRoads.has(button.dataset.block);const [a,b]=button.dataset.block;
  button.setAttribute('aria-pressed',String(blocked));
  button.setAttribute('aria-label',`${blocked?'Reopen':'Close'} road ${a} to ${b}`);
  button.querySelector('span').textContent=blocked?'Closed':'Open';
 });
 document.getElementById('route-status').textContent=result.path.length?result.path.join(' → '):'No route — reopen a road';
 document.getElementById('route-cost').textContent=result.cost??'—';
}
if(document.getElementById('route-status')) {
 document.querySelectorAll('[data-block]').forEach(button=>button.addEventListener('click',()=>{
  const road=button.dataset.block; closedRoads.has(road)?closedRoads.delete(road):closedRoads.add(road);renderRouteLab();
 }));
 document.getElementById('reset-roads').addEventListener('click',()=>{closedRoads.clear();renderRouteLab();});
 renderRouteLab();
}
