import { generateJSON } from '../gemini.js';

export const id = 'gemini';
export const label = 'Gemini';

const schema = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      description: { type: 'STRING' },
      category: { type: 'STRING' },
      prepMinutes: { type: 'INTEGER' },
      cookMinutes: { type: 'INTEGER' },
      ingredients: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: { name: { type: 'STRING' }, quantity: { type: 'STRING' } },
          required: ['name', 'quantity'],
        },
      },
      steps: { type: 'ARRAY', items: { type: 'STRING' } },
    },
    required: ['title', 'ingredients', 'steps'],
  },
};

// Recipes drawn from the model's own knowledge of classic and regional cooking.
export async function search(query, { count = 3 } = {}) {
  const recipes = await generateJSON({
    system: 'You are a professional chef. Give realistic, tested-style home recipes with metric quantities.',
    prompt: `Give ${count} distinct recipes matching: ${query}`,
    schema,
    temperature: 0.8,
  });
  return recipes.map((r) => ({
    id: `gemini:${crypto.randomUUID()}`,
    source: id,
    title: r.title,
    image: null,
    category: r.category ?? null,
    description: r.description ?? '',
    prepMinutes: r.prepMinutes ?? null,
    cookMinutes: r.cookMinutes ?? null,
    instructions: r.steps.join('\n'),
    ingredients: r.ingredients,
    sourceUrl: null,
  }));
}
