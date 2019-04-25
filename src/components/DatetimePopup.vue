<template>
  <section>
    <div key="overlay" class="vdatetime-overlay" @click.self="cancel"/>
    <div class="vdatetime-popup">
      <div class="vdatetime-popup__header" v-show="header">
        <!-- <div class="vdatetime-popup__year" @click="showYear" v-if="isDateMode">{{ year }}</div>
        <div class="vdatetime-popup__date" v-if="isDateMode">{{ dateFormatted }}</div> -->
        <div class="vdatetime-popup__date">{{ header }}</div>
      </div>
      <div class="vdatetime-popup__body">
        <datetime-year-picker
          class="datetime-year-picker"
          v-if="isYearStep"
          @change="onChangeYear"
          :min-date="minDatetimeUTC"
          :max-date="maxDatetimeUTC"
          :year="year"
        />
        <datetime-calendar
          class="datetime-calendar"
          v-if="isDateStep"
          @change="onChangeDate"
          @yearMode="showYear"
          :year="year"
          :month="month"
          :day="day"
          :min-date="minDatetimeUTC"
          :max-date="maxDatetimeUTC"
          :week-start="weekStart"
        />
        <datetime-time-picker
          class="datetime-time"
          v-if="isTimeShown"
          @change="onChangeTime"
          :hour="hour"
          :minute="minute"
          :second="second"
          :suffix="suffix"
          :use12-hour="use12Hour"
          :showSeconds="showSeconds"
          :hour-step="hourStep"
          :minute-step="minuteStep"
          :second-step="secondStep"
          :min-time="minTime"
          :max-time="maxTime"
        />
      </div>
      <div class="vdatetime-popup__actions">
        <div
          class="vdatetime-popup__actions__button vdatetime-popup__actions__button--cancel"
          @click="cancel"
        >{{ phrases.cancel }}</div>
        <div
          class="vdatetime-popup__actions__button vdatetime-popup__actions__button--confirm"
          @click="confirm"
        >{{ phrases.ok }}</div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import {DateTime} from 'luxon';
import {createFlowManagerFromType} from '../services/util';
import {Component, Prop, Vue, Emit, Watch} from 'vue-property-decorator';
import {IButtonOptions} from '../types/button-options.interface';
import {ITimeParts, ITouchedTimeParts} from '../types/time-parts';
import {DateTimePickerType} from '../types/datepicker-type.enum';
import {DateTimePickerSteps} from '../types/datepicker-steps.enum';
import DatetimeCalendar, {ChangeDateEvent} from './DatetimeCalendar.vue';
import DatetimeTimePicker from './DatetimeTimePicker.vue';
import DatetimeYearPicker from './DatetimeYearPicker.vue';

const KEY_TAB = 9;
const KEY_ENTER = 13;
const KEY_ESC = 27;

@Component({
  components: {
    DatetimeCalendar,
    DatetimeTimePicker,
    DatetimeYearPicker,
  },
})
export default class DatetimePopup extends Vue {
  @Prop({required: true})
  private datetime!: DateTime;

  @Prop({
    default() {
      return {
        ok: 'Ok',
        cancel: 'Cancel',
      };
    },
  })
  private phrases!: IButtonOptions;

  @Prop({default: DateTimePickerType.DATE})
  private type!: DateTimePickerType;
  @Prop({default: false})
  private use12Hour!: boolean;
  @Prop({default: false})
  private showSeconds!: boolean;
  @Prop({default: 1})
  private hourStep!: number;
  @Prop({default: 1})
  private minuteStep!: number;
  @Prop({default: 1})
  private secondStep!: number;
  @Prop({default: null})
  private minDatetime!: DateTime | null;
  @Prop({default: null})
  private maxDatetime!: DateTime | null;
  @Prop({default: false})
  private auto!: boolean;
  @Prop({default: 1})
  private weekStart!: number;
  @Prop({default: ''})
  private header!: string;

  private newDatetime = this.datetime;
  private flow = createFlowManagerFromType(this.type);
  private step = this.flow.first();
  private timePartsTouched: ITouchedTimeParts = {
    hours: false,
    minutes: false,
    suffix: false,
    seconds: false,
  };

  public created(): void {
    this.onKeyDown = this.onKeyDown.bind(this);
    document.addEventListener('keydown', this.onKeyDown);
  }

  public beforeDestroy(): void {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  public mounted(): void {
    document.body.appendChild(this.$el);
  }

  private get isDateMode(): boolean {
    return this.type !== DateTimePickerType.TIME;
  }

  private get isYearStep(): boolean {
    return this.step === DateTimePickerSteps.YEAR;
  }

  private get isDateStep(): boolean {
    return this.step === DateTimePickerSteps.DATE;
  }

  private get isTimeShown(): boolean {
    return (this.type === DateTimePickerType.DATE_TIME && this.isDateStep) || this.type === DateTimePickerType.TIME;
  }

  private get suffix(): boolean {
    return this.timePartsTouched.suffix;
  }
  private get year(): number {
    return this.newDatetime.year;
  }
  private get month(): number {
    return this.newDatetime.month;
  }
  private get day(): number {
    return this.newDatetime.day;
  }
  private get hour(): number {
    return this.newDatetime.hour;
  }
  private get minute(): number {
    return this.newDatetime.minute;
  }
  private get second(): number {
    return this.newDatetime.second;
  }
  private get dateFormatted(): string {
    return this.newDatetime.toLocaleString({
      month: 'long',
      day: 'numeric',
    });
  }

  private get minDatetimeUTC(): DateTime | null {
    return this.minDatetime ? this.minDatetime.toUTC() : null;
  }
  private get maxDatetimeUTC(): DateTime | null {
    return this.maxDatetime ? this.maxDatetime.toUTC() : null;
  }
  private get minTime(): string | null {
    return this.minDatetime &&
      this.minDatetime.year === this.year &&
      this.minDatetime.month === this.month &&
      this.minDatetime.day === this.day
      ? this.minDatetime.toFormat('HH:mm')
      : null;
  }
  private get maxTime(): string | null {
    return this.maxDatetime &&
      this.maxDatetime.year === this.year &&
      this.maxDatetime.month === this.month &&
      this.maxDatetime.day === this.day
      ? this.maxDatetime.toFormat('HH:mm')
      : null;
  }

  private onKeyDown(event: KeyboardEvent) {
    switch (event.keyCode) {
      case KEY_ESC:
      case KEY_TAB:
        this.cancel();
        break;

      case KEY_ENTER:
        this.nextStep();
        break;
    }
  }

  private nextStep() {
    this.step = this.flow.next(this.step);
    this.timePartsTouched = {
      hours: false,
      minutes: false,
      suffix: false,
      seconds: false,
    };

    if (this.step === DateTimePickerSteps.END) {
      this.emitConfirm(this.newDatetime);
    }
  }

  private showYear(): void {
    this.step = DateTimePickerSteps.YEAR;
    this.flow.diversion(DateTimePickerSteps.DATE);
  }

  private confirm(): void {
    this.nextStep();
  }

  @Emit('cancel')
  private cancel(): void {
    //
  }

  @Emit('confirm')
  private emitConfirm(dateTime: DateTime): DateTime {
    return dateTime;
  }

  private onChangeYear(year: number): void {
    this.newDatetime = this.newDatetime.set({year});

    // if (this.auto) {
    this.nextStep();
    // }
  }

  private onChangeDate(newDate: ChangeDateEvent): void {
    this.newDatetime = this.newDatetime.set(newDate);

    if (this.auto) {
      this.nextStep();
    }
  }
  private onChangeTime(touchedParts: ITimeParts) {
    const {hours, minutes, seconds, suffix} = touchedParts;
    this.timePartsTouched.suffix = suffix;

    if (Number.isInteger(hours)) {
      this.newDatetime = this.newDatetime.set({hour: hours});
      this.timePartsTouched.hours = true;
    }

    if (Number.isInteger(minutes)) {
      this.newDatetime = this.newDatetime.set({minute: minutes});
      this.timePartsTouched.minutes = true;
    }

    if (Number.isInteger(seconds)) {
      this.newDatetime = this.newDatetime.set({second: seconds});
      this.timePartsTouched.seconds = true;
    }
  }
}
</script>

<style lang="postcss" scoped>
.vdatetime-popup {
  --default-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
    'Droid Sans', 'Helvetica Neue', sans-serif;
  box-sizing: border-box;
  z-index: 1000;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  max-width: calc(100% - 30px);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
  color: var(--gray-btn-hover-color, black);
  font-family: var(--vdatetime-font, var(--default-font));
  background: var(--white, #fff);
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  & * {
    box-sizing: border-box;
  }
}

.vdatetime-popup__body {
  display: flex;
  justify-content: center;
}

.datetime-year-picker {
  flex-basis: 100%;
}

.datetime-calendar {
  flex: 1;
  border-right: 1px solid var(--primary, #6200ee);
}

.datetime-time {
  flex: 1.3;
}

.vdatetime-popup__header {
  padding: 15px 30px;
  background: var(--white, #fff);
  color: var(--primary, #6200ee);
  font-size: 32px;
}

.vdatetime-popup__year {
  display: block;
  font-weight: 300;
  font-size: 14px;
  opacity: 0.7;
  cursor: pointer;
  transition: opacity 0.3s;

  &:hover {
    opacity: 1;
  }
}

.vdatetime-popup__actions {
  padding: 0 20px 0 0;
  text-align: right;
}

.vdatetime-popup__actions__button {
  display: inline-block;
  border: none;
  padding: 10px 20px;
  background: transparent;
  font-size: 16px;
  color: var(--primary, #6200ee);
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: var(--gray-btn-hover-color, #e5e5e5);
  }
}

.vdatetime-overlay {
  z-index: 999;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: var(--gray-overlay);
  transition: opacity 0.5s;
}

@media (orientation: portrait) {
  .vdatetime-popup__body {
    display: block;
  }

  .datetime-calendar {
    border: none;
  }

  .vdatetime-popup {
    width: 340px;
  }
}

@media (orientation: landscape) and (min-width: 768px) {
  .vdatetime-popup__body {
    display: block;
  }

  .datetime-calendar {
    border: none;
  }

  .vdatetime-popup {
    width: 340px;
  }
}
</style>
