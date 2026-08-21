export function getApiErrorMessage(error, fallbackMessage = 'Request failed. Please try again.') {
  const data = error.response?.data;

  if (!data) {
    return error.message || fallbackMessage;
  }

  if (typeof data === 'string') {
    return data;
  }

  if (data.message) {
    return data.message;
  }

  const validationMessages = Object.values(data).filter(Boolean);

  if (validationMessages.length > 0) {
    return validationMessages.join(' ');
  }

  return fallbackMessage;
}
