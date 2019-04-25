// @ts-ignore
import {storiesOf} from '@storybook/vue';

// @ts-ignore
// import {linkTo} from '@storybook/addon-links';
import {DateTimePicker} from '../';
import { DateTimePickerType } from '@/types/datepicker-type.enum';

storiesOf('Header', module)
  .add('empty', () => ({
    components: {DateTimePicker},
    template: '<DateTimePicker :type="type" :headerText="headerText" :use12Hour="true"/>',
    data() {
      return {
        type: DateTimePickerType.DATE_TIME,
        headerText: 'test',
      };
    },
    // methods: {action: action('clicked')},
  }));
