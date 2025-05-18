export const getMonthYear = () => {
  const date = new Date();
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
};
