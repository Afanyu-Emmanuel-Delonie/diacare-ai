const key = 'diabetesKnowledgeBookmarks';

export function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

export function toggleBookmark(bookmarkId) {
  const bookmarks = getBookmarks();
  const nextBookmarks = bookmarks.includes(bookmarkId)
    ? bookmarks.filter((item) => item !== bookmarkId)
    : [...bookmarks, bookmarkId];

  localStorage.setItem(key, JSON.stringify(nextBookmarks));
  return nextBookmarks;
}
