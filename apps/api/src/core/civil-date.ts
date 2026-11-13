/** Last millisecond of a civil date in an IANA time zone. */
export function civilDateEnd(date: string, timeZone: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new RangeError('Invalid civil date');
  const [year, month, day] = date.split('-').map(Number);
  const start = new Date(Date.UTC(year, month - 1, day));
  if (start.toISOString().slice(0, 10) !== date) throw new RangeError('Invalid civil date');
  const nextMidnight = Date.UTC(year, month - 1, day + 1);
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  let instant = nextMidnight;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(instant)).map(part => [part.type, part.value]));
    const observed = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day),
      Number(parts.hour), Number(parts.minute), Number(parts.second));
    const delta = nextMidnight - observed;
    instant += delta;
    if (delta === 0) return new Date(instant - 1);
  }
  throw new RangeError('Civil date is not representable in this time zone');
}
