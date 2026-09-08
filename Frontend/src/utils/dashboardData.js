// Shared helpers for reading the loosely-typed { stats, sections, ...collections } shape
// returned by /api/dashboard/*, used by every role dashboard page.

export function dashboardCollection(data, key) {
  const value = data[key] || data.sections?.[key];
  return Array.isArray(value) ? value : [];
}

export function dashboardValue(data, key) {
  return data.stats?.[key] ?? data[key] ?? 0;
}

export function displayDashboardDate(input) {
  if (!input) return 'Not available';
  const date = new Date(input);
  return Number.isNaN(date.getTime())
    ? String(input)
    : date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
