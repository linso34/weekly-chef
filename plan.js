export function renderPlan(el) {
  el.innerHTML = `
    <h1 class="text-2xl font-bold">This week</h1>
    <p class="mt-2 text-stone-600">No plan yet.</p>
    <a href="#/plan/new" class="mt-4 inline-block rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white">Configure a weekly menu</a>`;
}

export function renderPlanNew(el) {
  el.innerHTML = `
    <h1 class="text-2xl font-bold">🍳 Configure Your Weekly Menu</h1>
    <p class="mt-2 text-stone-600">Planner form coming next.</p>
    <a href="#/plan" class="mt-4 inline-block text-emerald-700 underline">Back</a>`;
}
