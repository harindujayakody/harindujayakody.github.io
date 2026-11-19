// Sri Lankan NIC decoder (old: 9 digits + V/X; new: 12 digits), ported from github.com/harindujayakody/nic-information-finder.
// NIC numbers count the birthday as a day of the year in which February ALWAYS has 29 days: day 60 is always
// 29 February and day 61 always 1 March. Women have 500 added. Pure functions, no network or storage.

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const NIC_MONTH_DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

export type Nic = {
  format: "old" | "new";
  nic: string; // normalised: upper case, no spaces
  year: number;
  month: number; // 1 to 12
  day: number;
  dayNumber: number; // as written in the NIC (501+ for women)
  gender: "Male" | "Female";
  serial: string;
  checkDigit: string;
  converted?: string; // the same number in the other format, when it exists
};

export function decodeNic(input: string, today = new Date()): Nic | { error: string } {
  const nic = input.replace(/\s+/g, "").toUpperCase();
  let year: number, dayNumber: number, serial: string, checkDigit: string, format: Nic["format"];

  if (/^\d{9}[VX]$/.test(nic)) {
    format = "old";
    year = 1900 + Number(nic.slice(0, 2));
    dayNumber = Number(nic.slice(2, 5));
    serial = nic.slice(5, 8);
    checkDigit = nic[8];
  } else if (/^\d{12}$/.test(nic)) {
    format = "new";
    year = Number(nic.slice(0, 4));
    dayNumber = Number(nic.slice(4, 7));
    serial = nic.slice(7, 11);
    checkDigit = nic[11];
  } else {
    return { error: "Enter 9 digits followed by V or X (old format), or 12 digits (new format)." };
  }

  if (year < 1900 || year > today.getFullYear()) return { error: `${year} isn't a possible birth year.` };
  const gender = dayNumber > 500 ? "Female" : "Male";
  let day = dayNumber > 500 ? dayNumber - 500 : dayNumber;
  if (day < 1 || day > 366) return { error: `The day number ${String(dayNumber).padStart(3, "0")} is out of range (001 to 366 for men, 501 to 866 for women).` };
  if (day === 60 && !isLeapYear(year)) return { error: `This number points to 29 February ${year}, but ${year} wasn't a leap year.` };

  let month = 0;
  while (day > NIC_MONTH_DAYS[month]) day -= NIC_MONTH_DAYS[month++];

  // Old numbers convert by adding "19" and a 0 before the serial. New numbers convert back only for people born
  // in the 1900s whose serial starts with 0; the old letter (V or X) can't be recovered, so V is shown.
  const converted =
    format === "old"
      ? `${year}${nic.slice(2, 5)}0${serial}${checkDigit}`
      : year < 2000 && serial[0] === "0"
        ? `${nic.slice(2, 7)}${serial.slice(1)}${checkDigit}V`
        : undefined;

  return { format, nic, year, month: month + 1, day, dayNumber, gender, serial, checkDigit, converted };
}

export function ageOn(d: { year: number; month: number; day: number }, today = new Date()) {
  const beforeBirthday = today.getMonth() + 1 < d.month || (today.getMonth() + 1 === d.month && today.getDate() < d.day);
  return today.getFullYear() - d.year - (beforeBirthday ? 1 : 0);
}

export const weekday = (d: { year: number; month: number; day: number }) =>
  new Date(Date.UTC(d.year, d.month - 1, d.day)).toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" });
