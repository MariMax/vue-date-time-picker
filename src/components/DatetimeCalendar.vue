<template>
  <div class="vdatetime-calendar">
    <div class="vdatetime-calendar__navigation">
      <div class="vdatetime-calendar__navigation--previous" @click="previousMonth">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 61.3 102.8">
          <path fill="none" stroke="#444" stroke-width="14" stroke-miterlimit="10" d="M56.3 97.8L9.9 51.4 56.3 5"/>
        </svg>
      </div>
      <div class="vdatetime-calendar__current--month" @click="switchToYearMode">{{ monthName }} {{ newYear }}</div>
      <div class="vdatetime-calendar__navigation--next" @click="nextMonth">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 61.3 102.8">
          <path fill="none" stroke="#444" stroke-width="14" stroke-miterlimit="10" d="M56.3 97.8L9.9 51.4 56.3 5"/>
        </svg>
      </div>
    </div>
    <div class="vdatetime-calendar__month">
      <div class="vdatetime-calendar__month__weekday" v-for="weekday in weekdays" :key="weekday">{{ weekday }}</div>
      <div class="vdatetime-calendar__month__day" v-for="day in days" :key="day.day" @click="selectDay(day)" :class="{'vdatetime-calendar__month__day--selected': day.selected, 'vdatetime-calendar__month__day--disabled': day.disabled}">
        <span><span>{{ day.day }}</span></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {DateTime} from 'luxon';
import {monthDayIsDisabled, monthDays, months, weekdays} from '../services/util';
import {Component, Prop, Vue, Emit, Watch} from 'vue-property-decorator';
interface IDay {
  day: number | null;
  selected: boolean;
  disabled: boolean;
}

export interface ChangeDateEvent {
  year: number;
  month: number;
  day: number;
}

@Component
export default class DatetimeCalendar extends Vue {
  @Prop({required: true})
  private year!: number;
  @Prop({required: true})
  private month!: number;
  @Prop({required: true})
  private day!: number;
  @Prop({default() {
    return [];
  }})
  private disabled!: string[];
  @Prop({default: null})
  private minDate!: DateTime | null;
  @Prop({default: null})
  private maxDate!: DateTime | null;
  @Prop({default: 1})
  private weekStart!: number;

  private newDate = DateTime.fromObject({
    year: this.year,
    month: this.month,
    zone: 'UTC',
  });
  private weekdays = weekdays(this.weekStart);
  private months = months();

  private get newYear(): number {
    return this.newDate.year;
  }
  private get newMonth(): number {
    return this.newDate.month;
  }
  private get monthName(): string {
    return this.months[this.newMonth - 1];
  }
  private get days(): IDay[] {
    return monthDays(this.newYear, this.newMonth, this.weekStart).map(
      (day: number | null) => ({
        day,
        selected: Boolean(
          day &&
            this.year === this.newYear &&
            this.month === this.newMonth &&
            this.day === day,
        ),
        disabled:
          !day ||
          monthDayIsDisabled(
            this.minDate,
            this.maxDate,
            this.newYear,
            this.newMonth,
            day,
          ),
      }),
    );
  }

  @Emit('change')
  private emitChange(
    year: number,
    month: number,
    day: number,
  ): ChangeDateEvent {
    return {
      year,
      month,
      day,
    };
  }

  private selectDay(day: IDay): void {
    if (day.disabled) {
      return;
    }

    this.emitChange(this.newYear, this.newMonth, day.day || 1);
  }

  private previousMonth(): void {
    this.newDate = this.newDate.minus({months: 1});
  }

  private nextMonth(): void {
    this.newDate = this.newDate.plus({months: 1});
  }

  @Emit('yearMode')
  private switchToYearMode() {
    //
  }
}
</script>

<style lang="postcss">
.vdatetime-calendar__navigation,
.vdatetime-calendar__navigation * {
  box-sizing: border-box;
}

.vdatetime-calendar__navigation {
  position: relative;
  margin: 15px 0;
  padding: 0 30px;
  width: 100%;
}

.vdatetime-calendar__navigation--previous,
.vdatetime-calendar__navigation--next {
  position: absolute;
  top: 0;
  padding: 0 5px;
  width: 18px;
  cursor: pointer;

  & svg {
    width: 8px;

    & path {
      transition: stroke 0.3s;
    }
  }

  &:hover svg path {
    stroke: var(--gray-prev-next-month-arrow, black);
  }
}

.vdatetime-calendar__navigation--previous {
  left: 25px;
}

.vdatetime-calendar__navigation--next {
  right: 25px;
  transform: scaleX(-1);
}

.vdatetime-calendar__current--month {
  text-align: center;
  text-transform: capitalize;
}

.vdatetime-calendar__month {
  padding: 0 20px;
  transition: height 0.2s;
}

.vdatetime-calendar__month__weekday,
.vdatetime-calendar__month__day {
  display: inline-block;
  width: calc(100% / 7);
  line-height: 36px;
  text-align: center;
  font-size: 16px;
  font-weight: 300;
  cursor: pointer;

  & > span {
    display: block;
    width: 100%;
    position: relative;
    height: 0;
    padding: 0 0 100%;
    overflow: hidden;

    & > span {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      border: 0;
      border-radius: 50%;
      transition: background-color 0.3s, color 0.3s;
    }
  }
}

.vdatetime-calendar__month__weekday {
  font-weight: bold;
}

.vdatetime-calendar__month__day:hover > span > span {
  background: var(--gray-date-hover, #e5e5e5);
}

.vdatetime-calendar__month__day--selected {
  & > span > span,
  &:hover > span > span {
    color: var(--white, #fff);
    background: var(--primary, #6200ee);
  }
}

.vdatetime-calendar__month__day--disabled {
  opacity: 0.4;
  cursor: default;

  &:hover > span > span {
    color: inherit;
    background: transparent;
  }
}
</style>
