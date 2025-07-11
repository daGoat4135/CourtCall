import { format, startOfWeek, endOfWeek, addDays, isToday, isSameDay } from "date-fns";

export function getWeekDates(date: Date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const weekDates = [];
  
  for (let i = 0; i < 5; i++) { // Monday to Friday
    weekDates.push(addDays(start, i));
  }
  
  return weekDates;
}

export function formatWeekRange(date: Date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  
  return `${format(start, "MMM d")}-${format(end, "d, yyyy")}`;
}

export function getDayName(date: Date) {
  return format(date, "EEE").toUpperCase();
}

export function getDayNumber(date: Date) {
  return format(date, "d");
}

export function formatTime(time: string) {
  // Assuming time is in format "HH:mm"
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function createDateFromTimeString(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

export function isSameWeek(date1: Date, date2: Date) {
  const start1 = startOfWeek(date1, { weekStartsOn: 1 });
  const start2 = startOfWeek(date2, { weekStartsOn: 1 });
  return isSameDay(start1, start2);
}
