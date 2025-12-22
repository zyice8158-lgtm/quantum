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
    }
  }
}
