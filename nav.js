const ITEMS = [
  { path: '/plan', label: 'Plan', icon: '📅' },
  { path: '/recipes', label: 'Recipes', icon: '📖' },
  { path: '/prep', label: 'Prep Guide', icon: '🔪' },
  { path: '/grocery', label: 'Grocery', icon: '🛒' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export function renderNav(el) {
  el.innerHTML = `<ul class="mx-auto flex max-w-xl">${ITEMS.map(
    (i) => `<li class="flex-1"><a href="#${i.path}" data-path="${i.path}"
      class="flex flex-col items-center gap-0.5 py-2 text-xs text-stone-500">
      <span class="text-xl leading-none">${i.icon}</span>${i.label}</a></li>`
  ).join('')}</ul>`;
}

export function setActive(el, path) {
  for (const a of el.querySelectorAll('a')) {
    const on = path.startsWith(a.dataset.path);
    a.classList.toggle('text-emerald-600', on);
    a.classList.toggle('font-semibold', on);
    a.classList.toggle('text-stone-500', !on);
  }
}
