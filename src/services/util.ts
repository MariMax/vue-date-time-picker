import {DateTime, Info, Settings} from 'luxon';
import {getWeekStartByLocale} from 'weekstart';
import {FlowManager} from './FlowManager';
import { DateTimePickerType } from '@/types/datepicker-type.enum';
import { DateTimePickerSteps } from '@/types/datepicker-steps.enum';

export function capitalize(str: string): string {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}

export function datetimeFromISO(str: string): DateTime | null {
  const datetime = DateTime.fromISO(str).toUTC();

  return datetime.isValid ? datetime : null;
}

export function monthDays(year: number, month: number, firstWeekDay: number): Array<number | null> {
  const monthDate = DateTime.local(year, month, 1);
  let firstDay = monthDate.weekday - firstWeekDay;

  if (firstDay < 0) {
    firstDay += 7;
  }
  let lastDay = (firstWeekDay - monthDate.weekday - monthDate.daysInMonth) % 7;
  if (lastDay < 0) {
    lastDay += 7;
  }

  return new Array(monthDate.daysInMonth + firstDay + lastDay)
    .fill(null)
    .map((value, index) => {
      return index + 1 <= firstDay || index >= firstDay + monthDate.daysInMonth
        ? null
        : index + 1 - firstDay;
    });
}

export function monthDayIsDisabled(
  minDate: DateTime | null,
  maxDate: DateTime | null,
  year: number,
  month: number,
  day: number,
): boolean {
  const date = DateTime.fromObject({year, month, day, zone: 'UTC'});

  const min = minDate ? startOfDay(minDate) : null;
  const max = maxDate ? startOfDay(maxDate) : null;
  if (max && maxDate) {
    return date > maxDate;
  }
  if (min && minDate) {
    return date < minDate;
  }
  return false;
}

export function yearIsDisabled(
  minDate: DateTime | null,
  maxDate: DateTime | null,
  year: number,
): boolean {
  const minYear = minDate ? minDate.year : null;
  const maxYear = maxDate ? maxDate.year : null;

  return Boolean((minYear && year < minYear) || (maxYear && year > maxYear));
}

export function timeComponentIsDisabled(
  min: number | null,
  max: number | null,
  component: number,
): boolean {
  return Boolean((min && component < min) || (max && component > max));
}

export function weekdays(firstDayOfTheWeek: number): string[] {
  if (--firstDayOfTheWeek < 0) {
    firstDayOfTheWeek = 6;
  }

  let weekDays = Info.weekdays('short').map((day: string) => capitalize(day));

  weekDays = weekDays.concat(weekDays.splice(0, firstDayOfTheWeek));

  return weekDays;
}

export function months(): string[] {
  return Info.months().map((month: string) => capitalize(month));
}

export function hours(step: number): number[] {
  return new Array(Math.ceil(24 / step))
    .fill(null)
    .map((item, index) => index * step);
}

export function minutes(step: number): number[] {
  return new Array(Math.ceil(60 / step))
    .fill(null)
    .map((item, index) => index * step);
}

export function years(current: number): number[] {
  return new Array(201).fill(null).map((item, index) => current - 100 + index);
}

export function pad(n: number): string {
  return n < 10 ? '0' + n : n.toString();
}

export function startOfDay(datetime: DateTime): DateTime {
  return datetime.startOf('day');
}

export function startOfMinute(datetime: DateTime): DateTime {
  return datetime.startOf('minute');
}

export function createFlowManagerFromType(type: DateTimePickerType): FlowManager {
  let flow = [];

  switch (type) {
    case DateTimePickerType.DATE_TIME:
      flow = [DateTimePickerSteps.DATE];
      break;
    case DateTimePickerType.TIME:
      flow = [DateTimePickerSteps.TIME];
      break;
    default:
      flow = [DateTimePickerSteps.DATE];
  }

  return new FlowManager(flow, DateTimePickerSteps.END);
}

export function weekStart() {
  const firstDay = getWeekStartByLocale(Settings.defaultLocale);

  return firstDay === 0 ? 7 : firstDay;
}
