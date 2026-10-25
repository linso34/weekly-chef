const BASE = 'https://www.themealdb.com/api/json/v1/1';

export const id = 'themealdb';
export const label = 'TheMealDB';

export async function search(query) {
  const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`TheMealDB ${res.status}`);
  const { meals } = await res.json();
  return (meals ?? []).map(normalize);
}

function normalize(m) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = m[`strIngredient${i}`]?.trim();
    if (name) ingredients.push({ name, quantity: (m[`strMeasure${i}`] ?? '').trim() });
  }
  return {
    id: `themealdb:${m.idMeal}`,
    source: id,
    title: m.strMeal,
    image: m.strMealThumb ?? null,
    category: m.strCategory ?? null,
    instructions: m.strInstructions ?? '',
    ingredients,
    sourceUrl: m.strSource || null,
  };
}
