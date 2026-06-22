export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

export const required = (value, label) => (String(value || '').trim() ? '' : `${label} is required.`);

export const minLength = (value, length, label) =>
  String(value || '').length >= length ? '' : `${label} must be at least ${length} characters.`;

export const futureOrToday = (value, label) => {
  if (!value) return '';
  const selected = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected >= today ? '' : `${label} cannot be in the past.`;
};
