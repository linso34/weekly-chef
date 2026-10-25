// Tiny hash router: '#/plan', '#/recipes', ...
const routes = new Map();

export const route = (path, render) => routes.set(path, render);

export function startRouter(outlet, onChange) {
  const go = async () => {
    const path = location.hash.replace(/^#/, '') || '/plan';
    const render = routes.get(path) ?? routes.get('/plan');
    outlet.replaceChildren();
    onChange?.(path);
    try {
      await render(outlet);
    } catch (err) {
      console.error(err);
      outlet.textContent = `Something went wrong: ${err.message}`;
    }
  };
  addEventListener('hashchange', go);
  go();
}
