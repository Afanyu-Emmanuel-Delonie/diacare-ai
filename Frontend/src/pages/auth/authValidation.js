export const emailValidation = {
  required: 'Email is required.',
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Enter a valid email address.'
  }
};

export const passwordValidation = {
  required: 'Password is required.',
  minLength: {
    value: 8,
    message: 'Password must be at least 8 characters.'
  },
  maxLength: {
    value: 72,
    message: 'Password must not exceed 72 characters.'
  },
  validate: {
    strength: (value) =>
      /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value)
        ? true
        : 'Use uppercase, lowercase, and at least one number.'
  }
};
