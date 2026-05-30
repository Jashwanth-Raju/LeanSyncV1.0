export const isNonEmpty = (value?: string | null): boolean => {
  if (!value) return false;
  return value.trim().length > 0;
};

export const clamp = (value: number, min = 0, max = 1): number => {
  return Math.min(max, Math.max(min, value));
};
