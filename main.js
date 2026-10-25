import './styles/main.css';
import { route, startRouter } from './router.js';
import { renderNav, setActive } from './components/nav.js';
import { renderPlan, renderPlanNew } from './components/plan.js';
import { renderRecipes } from './components/recipes.js';
import { renderPrep } from './components/prep.js';
import { renderGrocery } from './components/grocery.js';
import { renderSettings } from './components/settings.js';

route('/plan', renderPlan);
route('/plan/new', renderPlanNew);
route('/recipes', renderRecipes);
route('/prep', renderPrep);
route('/grocery', renderGrocery);
route('/settings', renderSettings);

const nav = document.getElementById('nav');
renderNav(nav);
startRouter(document.getElementById('view'), (path) => setActive(nav, path));

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((err) => console.warn('SW registration failed', err));
  });
}
