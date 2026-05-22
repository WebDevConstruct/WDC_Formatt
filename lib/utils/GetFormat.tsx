
export const getFontSize = (sizeKey: string) => {
  const mapping: { [key: string]: number } = {
    'text-xs': 10,
    'text-sm': 12,
    'text-base': 14,
    'text-lg': 16,
    'text-xl': 18,
    'text-2xl': 24,
  };
  return mapping[sizeKey] || 12; // Default to 12 if not found
};