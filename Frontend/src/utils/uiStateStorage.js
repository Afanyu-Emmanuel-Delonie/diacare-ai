const STORAGE_KEY = 'diabetes-monitoring.ui.dismissals.v1';
const MAX_DISMISSALS = 200;

function readDismissals() {
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored)
      ? stored.filter((item) => typeof item === 'string').slice(-MAX_DISMISSALS)
      : [];
  } catch {
    return [];
  }
}

export function isUiItemDismissed(scope, id) {
  if (!scope || id === null || id === undefined) return false;
  return readDismissals().includes(`${scope}:${String(id)}`);
}

export function persistUiItemDismissal(scope, id) {
  if (!scope || id === null || id === undefined) return;

  try {
    const dismissal = `${scope}:${String(id)}`;
    const dismissals = readDismissals();
    if (!dismissals.includes(dismissal)) dismissals.push(dismissal);
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dismissals.slice(-MAX_DISMISSALS)));
  } catch {
    // Storage may be unavailable in privacy mode. Dismissal still works in component state.
  }
}

