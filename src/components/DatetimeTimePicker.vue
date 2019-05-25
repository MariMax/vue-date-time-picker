<template>
  <div 
    :class="{
      'vdatetime-time-picker': true, 
      'vdatetime-time-picker__with-suffix': use12Hour}
      ">
      <div class="vdatetime-time-picker__list-wrapper icon-time">
        <component :is="icon"/>
      </div>
    <div class="vdatetime-time-picker__list-wrapper">
      <div class="vdatetime-time-picker__gradient-top"></div>
      
      <div class="vdatetime-time-picker__list vdatetime-time-picker__list--hours" ref="hourList">
        <div  class="vdatetime-time-picker__item" >&nbsp;</div>
        <div  class="vdatetime-time-picker__item" 
              v-for="hour in hours" 
              :key="hour.hour" 
              @click="selectHour(hour)" 
              :class="{
                'vdatetime-time-picker__item--selected': hour.selected, 
                'vdatetime-time-picker__item--disabled': hour.disabled}">
          {{ hour.hour }}
        </div>
        <div class="vdatetime-time-picker__item" >&nbsp;</div>
      </div>
      
      <div class="vdatetime-time-picker__gradient-bottom"></div>
    </div>
    <div class="vdatetime-time-picker__list-wrapper">
      <div class="vdatetime-time-picker__gradient-top"></div>
      <div class="vdatetime-time-picker__list vdatetime-time-picker__list--minutes" ref="minuteList">
        <div class="vdatetime-time-picker__item" >&nbsp;</div>
        <div  class="vdatetime-time-picker__item" 
              v-for="minute in minutes" 
              :key="minute.minute" 
              @click="selectMinute(minute)" 
              :class="{
                'vdatetime-time-picker__item--selected': minute.selected, 
                'vdatetime-time-picker__item--disabled': minute.disabled}">
            {{ minute.minute }}
        </div>
        <div class="vdatetime-time-picker__item" >&nbsp;</div>
      </div>
      <div class="vdatetime-time-picker__gradient-bottom"></div>
    </div>
    <div class="vdatetime-time-picker__list-wrapper" v-if="showSeconds">
      <div class="vdatetime-time-picker__gradient-top"></div>

      <div class="vdatetime-time-picker__list vdatetime-time-picker__list--seconds" ref="secondList">
        <div class="vdatetime-time-picker__item" >&nbsp;</div>
        <div  class="vdatetime-time-picker__item" 
              v-for="second in seconds" 
              :key="second.second" 
              @click="selectSecond(second)" 
              :class="{
                'vdatetime-time-picker__item--selected': second.selected, 
                'vdatetime-time-picker__item--disabled': second.disabled}">
          {{ second.second }}
        </div>
        <div class="vdatetime-time-picker__item" >&nbsp;</div>
      </div>
      <div class="vdatetime-time-picker__gradient-bottom"></div>
    </div>

    <div class="vdatetime-time-picker__list-wrapper vdatetime-time-picker__list vdatetime-time-picker__list--suffix" ref="suffixList" v-if="use12Hour">
      <div class="vdatetime-time-picker__item" @click="selectSuffix(true)" :class="{'vdatetime-time-picker__item--selected': isAM}">am</div>
      <div class="vdatetime-time-picker__item" @click="selectSuffix(false)" :class="{'vdatetime-time-picker__item--selected': !isAM}">pm</div>
    </div>
  </div>
</template>

<script lang="ts">
import {hours, minutes, pad, timeComponentIsDisabled} from '../services/util';
import {Component, Prop, Vue, Emit, Watch} from 'vue-property-decorator';
import {ITimeParts} from '../types/time-parts';
import VueObject, {VueConstructor} from 'vue';
// import {COMMON_DEBOUNCE_TIME_MS} from '@/config/common-constants';

interface IHour {
  readonly hour: string;
  readonly selected: boolean;
  disabled: boolean;
}

interface IMinute {
  minute: string;
  selected: boolean;
  disabled: boolean;
}

interface ISecond {
  second: string;
  selected: boolean;
  disabled: boolean;
}

@Component
export default class TimePicker extends Vue {
  public $refs!: {
    hourList: HTMLDivElement;
    minuteList: HTMLDivElement;
    secondList: HTMLDivElement;
  };

  @Prop({default: null})
  private icon!: VueConstructor<VueObject>;
  @Prop({required: true})
  private hour!: number;
  @Prop({required: true})
  private minute!: number;
  @Prop({required: true})
  private second!: number;
  @Prop({required: true})
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
  private minTime!: string | null;
  @Prop({default: null})
  private maxTime!: string | null;

  @Prop({default: 250})
  private debounceTime!: number;

  private timoutId!: number;

  public mounted(): void {
    this.ajustSelectedPositions();
  }

  public beforeDestroy() {
    clearTimeout(this.timoutId);
  }

  private ajustSelectedPositions(): void {
    this.timoutId = setTimeout(() => {
      const selectedHour = this.$refs.hourList.querySelector(
        '.vdatetime-time-picker__item--selected',
      );
      const selectedMinute = this.$refs.minuteList.querySelector(
        '.vdatetime-time-picker__item--selected',
      );
      const selectedSecond = this.$refs.secondList
        ? this.$refs.secondList.querySelector(
            '.vdatetime-time-picker__item--selected',
          )
        : false;

      if (selectedHour) {
        this.scrollList(this.$refs.hourList, selectedHour as HTMLDivElement);
      }
      if (selectedMinute) {
        this.scrollList(
          this.$refs.minuteList,
          selectedMinute as HTMLDivElement,
        );
      }
      if (selectedSecond) {
        this.scrollList(
          this.$refs.secondList,
          selectedSecond as HTMLDivElement,
        );
      }
    }, this.debounceTime);
  }

  private scrollList(list: HTMLDivElement, selectedEl: HTMLDivElement): void {
    const listHeight = list.offsetHeight;
    const listTop = list.offsetTop;
    const selectedPositionTop = selectedEl.offsetTop;
    list.scrollTop = selectedPositionTop - listTop - listHeight / 3.5;
  }

  private get suffix(): boolean {
    return this.hour < 12;
  }
  private get isAM(): boolean {
    return this.suffix === true;
  }

  private get hours(): IHour[] {
    return hours(this.hourStep)
      .filter((hour: number) => {
        if (!this.use12Hour) {
          return true;
        } else {
          return hour > 0 && hour <= 12;
        }
      })
      .map((hourNumber: number) => {
        const self = this;
        return {
          get hour(): string {
            return pad(hourNumber);
          },
          get selected(): boolean {
            if (!self.use12Hour) {
              // 24 hours format
              return hourNumber === self.hour;
            }
            if (self.hour > 12) {
              // PM
              return hourNumber === self.hour - 12;
            }
            // AM

            return (
              hourNumber === self.hour || (hourNumber === 12 && self.hour === 0)
            );
          },
          disabled: timeComponentIsDisabled(
            this.minHour,
            this.maxHour,
            hourNumber,
          ),
        };
      });
  }
  private get minutes(): IMinute[] {
    return minutes(this.minuteStep).map((minute: number) => ({
      minute: pad(minute),
      selected: minute === this.minute,
      disabled: timeComponentIsDisabled(this.minMinute, this.maxMinute, minute),
    }));
  }
  private get seconds(): ISecond[] {
    return minutes(this.secondStep).map((second: number) => ({
      second: pad(second),
      selected: second === this.second,
      disabled: timeComponentIsDisabled(this.minSecond, this.maxSecond, second),
    }));
  }
  private get minHour(): number | null {
    return this.minTime ? parseInt(this.minTime.split(':')[0], 10) : null;
  }
  private get minMinute(): number | null {
    return this.minTime && this.minHour === this.hour
      ? parseInt(this.minTime.split(':')[1], 10)
      : null;
  }
  private get minSecond(): number | null {
    return this.minTime &&
      this.minHour === this.hour &&
      this.minMinute === this.minute
      ? parseInt(this.minTime.split(':')[2], 10)
      : null;
  }
  private get maxHour(): number | null {
    return this.maxTime ? parseInt(this.maxTime.split(':')[0], 10) : null;
  }
  private get maxMinute(): number | null {
    return this.maxTime && this.maxHour === this.hour
      ? parseInt(this.maxTime.split(':')[1], 10)
      : null;
  }
  private get maxSecond(): number | null {
    return this.maxTime &&
      this.maxHour === this.hour &&
      this.maxMinute === this.minute
      ? parseInt(this.maxTime.split(':')[2], 10)
      : null;
  }

  @Emit('change')
  private emitChange(change: ITimeParts): ITimeParts {
    let fullHours = null;

    if (this.use12Hour) {
      if (change.suffix === true && change.hours >= 12) {
        // AM
        fullHours = change.hours - 12;
      }
      if (change.suffix === false && change.hours < 12) {
        // PM
        fullHours = change.hours + 12;
      }

      if (fullHours === null) {
        fullHours = change.hours;
      }

      return {
        ...change,
        hours: fullHours,
      };
    }
    return change;
  }

  private selectHour(hour: IHour): void {
    if (hour.disabled) {
      return;
    }

    this.ajustSelectedPositions();
    this.emitChange({
      hours: parseInt(hour.hour, 10),
      minutes: this.minute,
      seconds: this.second,
      suffix: this.suffix,
    });
  }

  private selectMinute(minute: IMinute): void {
    if (minute.disabled) {
      return;
    }

    this.ajustSelectedPositions();

    this.emitChange({
      hours: this.hour,
      minutes: parseInt(minute.minute, 10),
      seconds: this.second,
      suffix: this.suffix,
    });
  }

  private selectSecond(second: ISecond): void {
    if (second.disabled) {
      return;
    }

    this.ajustSelectedPositions();

    this.emitChange({
      hours: this.hour,
      minutes: this.minute,
      seconds: parseInt(second.second, 10),
      suffix: this.suffix,
    });
  }

  private selectSuffix(suffix: boolean): void {
    this.emitChange({
      hours: this.hour,
      minutes: this.minute,
      seconds: this.second,
      suffix,
    });
  }
}
</script>

<style lang="postcss" scoped>
.vdatetime-time-picker {
  border: none;
  box-sizing: border-box;
  display: flex;

  &::after {
    content: '';
    display: table;
    clear: both;
  }

  & * {
    box-sizing: border-box;
  }
}

.vdatetime-time-picker__list-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

.icon-time {
  flex: 0;
  color: var(--primary, #6200ee);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  padding: 0 0 0 .5rem;
}

.vdatetime-time-picker__list {
  max-height: 60px;
  overflow-y: scroll;
  flex: 1;

  &--suffix {
    overflow: hidden;
  }

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: var(--gray-scroll-track, #e5e5e5);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--gray-scroll-thumb, #c5c5c5);
  }
}

.vdatetime-time-picker__gradient-top,
.vdatetime-time-picker__gradient-bottom {
  position: absolute;
  height: 30px;
  width: 100%;
  pointer-events: none;
}

.vdatetime-time-picker__gradient-top {
  top: -1px;
  left: 1px;
  background-image: linear-gradient(to bottom, var(--white, #fff), var(--white, #fff) 20%, transparent);
}
.vdatetime-time-picker__gradient-bottom {
  bottom: -1px;
  left: 1px;
  background-image: linear-gradient(to top, var(--white, #fff), var(--white, #fff) 20%, transparent);
}

.vdatetime-time-picker__item {
  padding: 5px 0;
  font-size: 20px;
  line-height: 1;
  text-align: center;
  cursor: pointer;
  transition: font-size 0.3s;
  user-select: none;
}

.vdatetime-time-picker__item:hover {
  font-size: 20px;
}

.vdatetime-time-picker__item--selected {
  color: var(--primary, #6200ee);
  font-size: 20px;
}

.vdatetime-time-picker__item--disabled {
  opacity: 0.4;
  cursor: default;
  font-size: 20px !important;
}

.vdatetime-time-picker__list--suffix {
  align-self: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

@media (orientation: landscape) and (min-width: 768px) {
  .vdatetime-time-picker {
    border-top: 1px solid transparent;
    border-bottom: 1px solid transparent;
  }
}

</style>
