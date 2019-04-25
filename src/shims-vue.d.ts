declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

declare module 'weekstart';

declare module '@storybook/vue' {
  // let storiesOf: any;
  export function storiesOf(...args : any[]): any;

}
