<template>
  <div class="vdatetime-year-picker">
    <div class="vdatetime-year-picker__list vdatetime-year-picker__list" ref="yearList">
      <div class="vdatetime-year-picker__item" 
        v-for="year in years" 
        :key="year.year" 
        @click="select(year)" 
        :class="{
          'vdatetime-year-picker__item--selected': year.selected,
          'vdatetime-year-picker__item--disabled': year.disabled}
          ">
          {{ year.year }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {DateTime} from 'luxon';
import {yearIsDisabled, years} from '../services/util';
import {Component, Prop, Vue, Emit, Watch} from 'vue-property-decorator';

interface IYear {
  year: number;
  selected: boolean;
  disabled: boolean;
}

@Component
export default class YearPicker extends Vue {
  public $refs!: {
    yearList: HTMLDivElement;
  };

  @Prop({required: true})
  private year!: number;
  @Prop({default: null})
  private minDate!: DateTime | null;
  @Prop({default: null})
  private maxDate!: DateTime | null;
  @Prop({default: 250})
  private debounceTime!: number;

  private get years(): IYear[] {
    return years(this.year).map((year: number) => ({
      year,
      selected: year === this.year,
      disabled: !year || yearIsDisabled(this.minDate, this.maxDate, year),
    }));
  }

  public mounted(): void {
    this.ajustSelectedPositions();
  }

  public updated(): void {
    this.ajustSelectedPositions();
  }

  private ajustSelectedPositions(): void {
    setTimeout(() => {
      const selectedYear = this.$refs.yearList.querySelector(
        '.vdatetime-year-picker__item--selected',
      );

      if (selectedYear) {
        this.scrollList(this.$refs.yearList, selectedYear as HTMLDivElement);
      }
    }, this.debounceTime);
  }

  private scrollList(list: HTMLDivElement, selectedEl: HTMLDivElement): void {
    const listHeight = list.offsetHeight;
    const listTop = list.offsetTop;
    const selectedPositionTop = selectedEl.offsetTop;
    list.scrollTop = selectedPositionTop - listTop - listHeight / 3.5;
  }

  private select(year: IYear): void {
    if (year.disabled) {
      return;
    }

    this.change(year.year);
  }

  @Emit('change')
  private change(year: number): number {
    return year;
  }
}
</script>

<style lang="postcss" scoped>
.vdatetime-year-picker {
  box-sizing: border-box;

  &::after {
    content: '';
    display: table;
    clear: both;
  }

  & * {
    box-sizing: border-box;
  }
}

.vdatetime-year-picker__list {
  float: left;
  width: 100%;
  height: 305px;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-track {
    background: var(--gray-scroll-track, #e5e5e5);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--gray-scroll-thumb, #c5c5c5);
  }
}

.vdatetime-year-picker__item {
  padding: 10px 0;
  font-size: 20px;
  text-align: center;
  cursor: pointer;
  transition: font-size 0.3s;
}

.vdatetime-year-picker__item:hover {
  font-size: 32px;
}

.vdatetime-year-picker__item--selected {
  color: var(--primary, #6200ee);
  font-size: 32px;
}

.vdatetime-year-picker__item--disabled {
  opacity: 0.4;
  cursor: default;

  &:hover {
    color: inherit;
    background: transparent;
  }
}
</style>
