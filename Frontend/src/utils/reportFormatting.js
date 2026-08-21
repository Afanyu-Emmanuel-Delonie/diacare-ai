export function formatLabel(value) {
  return String(value || '')
    .replaceAll('_', ' ')
    .replace(/\bDeleted\b/g, 'Archived')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatDateTime(value) {
  if (!value) {
    return 'No data available for this section.';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

export function formatDate(value) {
  if (!value) {
    return 'Not selected';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
}

export function displayValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'No data available for this section.';
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : 'No data available for this section.';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}
