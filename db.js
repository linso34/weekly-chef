// Minimal promise wrapper over IndexedDB. Every store uses `id` as its key.
const DB_NAME = 'weeklychef';
const VERSION = 1;
const STORES = ['recipes', 'plans', 'groceries'];

let dbPromise;
function open() {
  return (dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      for (const name of STORES) {
        if (!req.result.objectStoreNames.contains(name)) req.result.createObjectStore(name, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}

async function run(store, mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const request = fn(t.objectStore(store));
    t.oncomplete = () => resolve(request.result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

export const db = {
  get: (store, id) => run(store, 'readonly', (o) => o.get(id)),
  getAll: (store) => run(store, 'readonly', (o) => o.getAll()),
  put: (store, value) => run(store, 'readwrite', (o) => o.put(value)),
  delete: (store, id) => run(store, 'readwrite', (o) => o.delete(id)),
};
