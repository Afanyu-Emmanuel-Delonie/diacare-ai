export function getSafeAuthError(error, fallbackMessage) {
  const status = error.response?.status;

  if (status === 401 || status === 403) {
    return fallbackMessage;
  }

  if (status === 400) {
    const data = error.response?.data;
    if (typeof data?.message === 'string' && data.message.length <= 160) {
      return data.message;
    }

    if (data && typeof data === 'object') {
      const firstValidationMessage = Object.values(data).find((value) => typeof value === 'string');
      if (firstValidationMessage) {
        return firstValidationMessage;
      }
    }
  }

  if (status >= 500) {
    return 'Authentication service is temporarily unavailable. Please try again later.';
  }

  return fallbackMessage;
}
