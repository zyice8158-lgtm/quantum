import { h, defineComponent, type Component } from 'vue'

export function HOCHooks<T>(Comp: Component, config: T) {

    return defineComponent({
        render() {
            return h(
                Comp,
                config,
                this.$slots
            )
        }
    })
} 
