import { searchRecipes, SOURCES } from '../services/recipes/index.js';
import { esc } from '../utils/dom.js';

export function renderRecipes(el) {
  el.innerHTML = `
    <h1 class="text-2xl font-bold">Recipes</h1>
    <form id="search" class="mt-4 flex gap-2">
      <input name="q" required placeholder="e.g. lemon chicken" class="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2" />
      <button class="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white">Search</button>
    </form>
    <p class="mt-1 text-xs text-stone-500">Sources: ${SOURCES.map((s) => esc(s.label)).join(', ')}</p>
    <div id="results" class="mt-4 space-y-3"></div>`;

  const results = el.querySelector('#results');
  el.querySelector('#search').addEventListener('submit', async (e) => {
    e.preventDefault();
    results.innerHTML = '<p class="text-stone-500">Searching…</p>';
    const { recipes, errors } = await searchRecipes(new FormData(e.target).get('q'));
    results.innerHTML =
      recipes
        .map(
          (r) => `<article class="rounded-xl border border-stone-200 bg-white p-3">
            <div class="flex gap-3">
              ${r.image ? `<img src="${esc(r.image)}" alt="" class="h-16 w-16 rounded-lg object-cover" loading="lazy" />` : ''}
              <div><h2 class="font-semibold">${esc(r.title)}</h2>
              <p class="text-xs text-stone-500">${esc(r.source)}${r.category ? ` · ${esc(r.category)}` : ''}</p></div>
            </div></article>`
        )
        .join('') +
      errors.map((x) => `<p class="text-sm text-amber-700">${esc(x.source)}: ${esc(x.message)}</p>`).join('') +
      (!recipes.length && !errors.length ? '<p class="text-stone-500">No results.</p>' : '');
  });
}
