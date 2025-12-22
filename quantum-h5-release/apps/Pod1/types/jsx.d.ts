import type { NativeElements, ReservedProps, VNode } from 'vue'

declare global {
  namespace JSX {
    export interface Element extends VNode { }
    export interface ElementClass {
      $props: {}
    }
    export interface ElementAttributesProperty {
      $props: {}
    }
    export interface IntrinsicElements extends NativeElements {
      [name: string]: any
    }
    export interface IntrinsicAttributes extends ReservedProps {
      class?: string;
      style?: string | Record<string, any>;
      onClick?: (event: MouseEvent) => void;
      onMousedown?: (event: MouseEvent) => void;
      onMouseup?: (event: MouseEvent) => void;
      onMouseenter?: (event: MouseEvent) => void;
      onMouseleave?: (event: MouseEvent) => void;
      onContextmenu?: (event: MouseEvent) => void;
    }
  }
  type Booleanish = boolean | 'true' | 'false';
  type Numberish = number | string;
  type Nullable<T = void> = T | null | undefined;
  type PassThrough<T = void> = T | object | undefined;
  type DesignToken<T = void> = T | object | undefined;
  type DefaultPassThrough<T = void> = T | ((instance?: VNode) => T | undefined) | undefined;
  type HintedString<T extends string> = (string & {}) | T;
  type NoInfer<T> = [T][T extends any ? 0 : never];
}

