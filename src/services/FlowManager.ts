import {DateTimePickerSteps} from '@/types/datepicker-steps.enum';

export class FlowManager {
  private diversionNext: DateTimePickerSteps | null = null;
  constructor(
    private flow: DateTimePickerSteps[] = [],
    private endStatus: DateTimePickerSteps = DateTimePickerSteps.END,
  ) {}

  public step(index: number): DateTimePickerSteps {
    return this.flow.length > index ? this.flow[index] : this.endStatus;
  }

  public first(): DateTimePickerSteps {
    return this.step(0);
  }

  public next(current: DateTimePickerSteps): DateTimePickerSteps {
    if (this.diversionNext) {
      const next = this.diversionNext;
      this.diversionNext = null;

      return next;
    }

    return this.step(this.flow.indexOf(current) + 1);
  }

  public diversion(next: DateTimePickerSteps): void {
    this.diversionNext = next;
  }
}
