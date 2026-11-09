import { toEpoch } from "./time";

function stamp(epoch: number): string {
  return new Date(epoch).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escape(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function buildIcs(args: {
  reference: string;
  title: string;
  description: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
}): string {
  const start = toEpoch(args.date, args.startTime);
  const end = toEpoch(args.date, args.endTime);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sonia Brown//Bookings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${args.reference}@soniabrown`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escape(args.title)}`,
    `DESCRIPTION:${escape(args.description)}`,
    `LOCATION:${escape(args.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
