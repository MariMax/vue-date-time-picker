import {DateTimePickerType} from './datepicker-type.enum';
import {DateTimeFormatOptions} from 'luxon';
import {IButtonOptions} from './button-options.interface';

export interface IDateTimePicker {
  value: string;
  valueZone: string;
  inputId: string;
  inputClass: string;
  hiddenName: string;
  zone: string;
  format: DateTimeFormatOptions | null;
  type: DateTimePickerType;
  phrases: IButtonOptions;
  use12Hour: boolean;
  showSeconds: boolean;
  hourStep: number;
  minuteStep: number;
  minDatetime: string | null;
  maxDatetime: string | null;
  auto: boolean;
  weekStart: number;
}
