// Recipe source registry. A source is a module exporting { id, label, search(query) }
// that returns recipes in the shared shape (id, source, title, image, category,
// instructions, ingredients[{name, quantity}], sourceUrl). To add one, import it and add it here.
import * as gemini from './gemini.js';
import * as themealdb from './themealdb.js';

export const SOURCES = [gemini, themealdb];

export async function searchRecipes(query, enabled = SOURCES.map((s) => s.id)) {
  const active = SOURCES.filter((s) => enabled.includes(s.id));
  const settled = await Promise.allSettled(active.map((s) => s.search(query)));
  return {
    recipes: settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])),
    errors: settled.flatMap((r, i) => (r.status === 'rejected' ? [{ source: active[i].label, message: r.reason?.message ?? String(r.reason) }] : [])),
  };
}
