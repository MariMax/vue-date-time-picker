<template>
  <div class="vdatetime">
    <slot name="before"></slot>
    <input class="vdatetime-input"
           :class="inputClass"
           :id="inputId"
           type="text"
           :value="inputValue"
           v-bind="$attrs"
           v-on="$listeners"
           @click="open"
           @focus="open">
    <input v-if="hiddenName" type="hidden" :name="hiddenName" :value="value" @input="setValue">
    <slot name="after"></slot>
    <transition-group name="vdatetime-fade" tag="div">
      <datetime-popup
          class="datetime-popup"
          :header="headerText"
          key="popup"
          v-if="isOpen"
          :type="type"
          :datetime="popupDate"
          :phrases="phrases"
          :use12-hour="use12Hour"
          :showSeconds="showSeconds"
          :hour-step="hourStep"
          :minute-step="minuteStep"
          :min-datetime="popupMinDatetime"
          :max-datetime="popupMaxDatetime"
          @confirm="confirm"
          @cancel="cancel"
          :auto="auto"
          :week-start="weekStart"></datetime-popup>
    </transition-group>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Emit, Watch} from 'vue-property-decorator';
import {DateTime, DateTimeFormatOptions} from 'luxon';
import DatetimePopup from './DatetimePopup.vue';
import {datetimeFromISO, startOfDay, weekStart, startOfMinute} from '../services/util';
import {IButtonOptions} from '../types/button-options.interface';
import {DateTimePickerType} from '../types/datepicker-type.enum';
import {IDateTimePicker} from '../types/datetime-picker.interface';

@Component({
  components: {
    DatetimePopup,
  },
})
export default class DateTimePicker extends Vue implements IDateTimePicker {
  @Prop({default: ''})
  public value!: string;
  @Prop({default: 'UTC'})
  public valueZone!: string;
  @Prop({default: ''})
  public inputId!: string;
  @Prop({default: ''})
  public inputClass!: string;
  @Prop({default: ''})
  public hiddenName!: string;
  @Prop({default: 'local'})
  public zone!: string;

  @Prop({default: null})
  public format!: DateTimeFormatOptions | null;

  @Prop({default: DateTimePickerType.DATE})
  public type!: DateTimePickerType;
  @Prop({
    default() {
      return {
        ok: 'Ok',
        cancel: 'Cancel',
      };
    },
  })
  public phrases!: IButtonOptions;
  @Prop({default: false})
  public use12Hour!: boolean;
  @Prop({default: false})
  public showSeconds!: boolean;
  @Prop({default: 1})
  public hourStep!: number;
  @Prop({default: 1})
  public minuteStep!: number;
  @Prop({default: null})
  public minDatetime!: string | null;
  @Prop({default: null})
  public maxDatetime!: string | null;
  @Prop({default: false})
  public auto!: boolean;
  @Prop({default: weekStart()})
  public weekStart!: number;
  @Prop({default: ''})
  public headerText!: string;

  private isOpen = false;
  private datetime = datetimeFromISO(this.value);

  public created(): void {
    this.emitInput();
  }

  private get inputValue(): string {
    let format = this.format;

    if (!format) {
      switch (this.type) {
        case DateTimePickerType.DATE:
          format = DateTime.DATE_MED;
          break;
        case DateTimePickerType.TIME:
          format = DateTime.TIME_24_SIMPLE;
          break;
        case DateTimePickerType.DATE_TIME:
          format = DateTime.DATETIME_MED;
          break;
      }
    }

    if (typeof format === 'string') {
      return this.datetime
        ? this.datetime.setZone(this.zone).toFormat(format)
        : '';
    } else {
      return this.datetime
        ? this.datetime.setZone(this.zone).toLocaleString(format || undefined)
        : '';
    }
  }
  private get popupDate() {
    return this.datetime
      ? this.datetime.setZone(this.zone)
      : this.newPopupDatetime();
  }
  private get popupMinDatetime() {
    return this.minDatetime
      ? DateTime.fromISO(this.minDatetime).setZone(this.zone)
      : null;
  }
  private get popupMaxDatetime() {
    return this.maxDatetime
      ? DateTime.fromISO(this.maxDatetime).setZone(this.zone)
      : null;
  }

  private open(event: MouseEvent) {
    if (event.target) {
      (event.target as HTMLElement).blur();
    }

    this.isOpen = true;
  }
  @Emit('close')
  private close(): void {
    this.isOpen = false;
  }
  private confirm(datetime: DateTime): void {
    this.datetime = datetime.toUTC();
    this.emitInput();
    this.close();
  }
  private cancel(): void {
    this.close();
  }
  private newPopupDatetime() {
    let datetime = DateTime.utc()
      .setZone(this.zone)
      .set({second: 0, millisecond: 0});

    if (this.popupMinDatetime && datetime < this.popupMinDatetime) {
      datetime = this.popupMinDatetime.set({second: 0, millisecond: 0});
    }

    if (this.popupMaxDatetime && datetime > this.popupMaxDatetime) {
      datetime = this.popupMaxDatetime.set({second: 0, millisecond: 0});
    }

    if (this.minuteStep === 1) {
      return datetime;
    }

    const roundedMinute =
      Math.round(datetime.minute / this.minuteStep) * this.minuteStep;

    if (roundedMinute === 60) {
      return datetime.plus({hours: 1}).set({minute: 0});
    }

    return datetime.set({minute: roundedMinute});
  }
  private setValue(event: KeyboardEvent) {
    this.datetime = datetimeFromISO((event.target as HTMLInputElement).value);
    this.emitInput();
  }

  @Watch('value')
  private onValueChanged(newValue: string) {
    this.datetime = datetimeFromISO(newValue);
  }

  @Watch('valueZone')
  private onTimeZoneChanged(newValue: string) {
    this.emitInput();
  }

  @Emit('input')
  private emitInput(): string {
    let datetime = this.datetime ? this.datetime.setZone(this.valueZone) : null;

    if (datetime && this.type === DateTimePickerType.DATE) {
      datetime = startOfDay(datetime);
    }

    if (datetime && this.showSeconds === false) {
      datetime = startOfMinute(datetime);
    }

    return datetime ? datetime.toISO() : '';
  }
}
</script>

<style>
.vdatetime-fade-enter-active,
.vdatetime-fade-leave-active {
  transition: opacity 0.4s;
}

.vdatetime-fade-enter,
.vdatetime-fade-leave-to {
  opacity: 0;
}
</style>
