import { getApiKey, setApiKey, getSettings, saveSettings } from '../services/settings.js';
import { ping } from '../services/gemini.js';
import { esc } from '../utils/dom.js';

const field = 'mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2';

export function renderSettings(el) {
  const s = getSettings();
  el.innerHTML = `
    <h1 class="text-2xl font-bold">Settings</h1>
    <form id="form" class="mt-4 space-y-4">
      <label class="block text-sm font-medium">Gemini API key
        <input name="key" type="password" autocomplete="off" value="${esc(getApiKey())}" class="${field}" />
      </label>
      <label class="block text-sm font-medium">Model
        <input name="model" value="${esc(s.model)}" class="${field}" />
      </label>
      <div class="flex gap-3">
        <label class="block flex-1 text-sm font-medium">Adults
          <input name="adults" type="number" min="0" value="${s.adults}" class="${field}" /></label>
        <label class="block flex-1 text-sm font-medium">Kids
          <input name="kids" type="number" min="0" value="${s.kids}" class="${field}" /></label>
      </div>
      <label class="block text-sm font-medium">Dietary restrictions
        <input name="diet" placeholder="e.g. no pork, nut allergy" value="${esc(s.diet)}" class="${field}" />
      </label>
      <div class="flex gap-2">
        <button class="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white">Save</button>
        <button type="button" id="test" class="rounded-xl border border-stone-300 bg-white px-4 py-2 font-semibold">Test connection</button>
      </div>
      <p id="status" class="text-sm" role="status"></p>
    </form>`;

  const form = el.querySelector('#form');
  const status = el.querySelector('#status');
  const say = (msg, ok = true) => {
    status.textContent = msg;
    status.className = `text-sm ${ok ? 'text-emerald-700' : 'text-red-700'}`;
  };

  const save = () => {
    const d = new FormData(form);
    setApiKey(d.get('key'));
    saveSettings({
      model: String(d.get('model')).trim() || undefined,
      adults: Number(d.get('adults')) || 0,
      kids: Number(d.get('kids')) || 0,
      diet: String(d.get('diet')).trim(),
    });
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    save();
    say('Saved.');
  });

  el.querySelector('#test').addEventListener('click', async () => {
    save();
    say('Testing…');
    try {
      say(`Connected. Model replied: ${await ping()}`);
    } catch (err) {
      say(err.message, false);
    }
  });
}
