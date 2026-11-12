export const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const vietnamDateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: VIETNAM_TIME_ZONE,
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

export function vietnamDateTimeParts(value: Date | string) {
  const parts = Object.fromEntries(vietnamDateTimeFormatter.formatToParts(new Date(value)).map(part => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

export function vietnamLocalToIso(value: string): string {
  return new Date(`${value}:00+07:00`).toISOString();
}
