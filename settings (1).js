// Settings live in localStorage. Note: the API key is readable by any script on this origin,
// so only run this app from an origin you control.
const SETTINGS_KEY = 'weeklychef.settings';
const API_KEY = 'weeklychef.geminiKey';

export const DEFAULTS = { model: 'gemini-2.5-flash', adults: 2, kids: 2, diet: '' };

export function getSettings() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(patch) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...getSettings(), ...patch }));
}

export const getApiKey = () => localStorage.getItem(API_KEY) ?? '';

export function setApiKey(key) {
  const k = (key ?? '').trim();
  if (k) localStorage.setItem(API_KEY, k);
  else localStorage.removeItem(API_KEY);
}
