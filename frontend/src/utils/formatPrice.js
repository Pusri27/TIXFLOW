/**
 * Formats ticket prices cleanly across IDR-seeded Indonesian events (>= 10,000 or 0)
 * and smaller USD test listings (1..9,999).
 */
export function formatPrice(amount) {
  const num = Number(amount || 0);
  if (num === 0) return 'IDR 0';
  if (num >= 10000) {
    return `IDR ${num.toLocaleString('en-US')}`;
  }
  return `$${num.toLocaleString('en-US')}`;
}

export function formatCompactPrice(amount) {
  const num = Number(amount || 0);
  if (num === 0) return 'IDR 0';
  if (num >= 1000000) {
    const millions = (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1);
    return `IDR ${millions}M`;
  }
  if (num >= 10000) {
    return `IDR ${Math.round(num / 1000)}K`;
  }
  return `$${num.toLocaleString('en-US')}`;
}
