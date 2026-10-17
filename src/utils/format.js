export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const round1 = (n) => Math.round(n * 10) / 10;

/** 12.34 -> "12.3". Missing values show a dash. */
export const fmt1 = (n) => (n == null ? '–' : round1(n).toLocaleString('en-CA', { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
export const fmt0 = (n) => (n == null ? '–' : Math.round(n).toLocaleString('en-CA'));

/** "2013-07-04" -> "Jul 4, 2013". Parsed by hand so time zones can never shift the day. */
export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
