// import { log } from 'console'
import { h, defineComponent, type Component } from 'vue'
const Test = {
    setup() {
        console.log('setup--------');
    },
    created() {
        this.aaa = '123';
        console.log('created----------')
    }
}
export function HOCHooks<T>(Comp: Component, config: T) {

    const { name } = Comp

    // console.log('p-comp');
    return defineComponent({
        mixins: [Test],
        render() {
            return h(
                Comp,
                config,
                this.$slots
            )
        }
    })
} 
