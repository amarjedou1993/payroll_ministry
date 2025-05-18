export function getMonthYear() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure two digits (01-12)
  const year = String(date.getFullYear()).slice(-2); // Get last two digits of the year

  return `${month}-${year}`;
}
