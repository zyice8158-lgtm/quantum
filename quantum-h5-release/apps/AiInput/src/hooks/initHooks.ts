import { ref } from 'vue'
const init = ref(false)
export const initAuthHooks = () => {
    const initFunc = () => {
        return new Promise((resolve) => {

            init.value = false;
        })
    }
    return {
        initFunc,
        init
    }
}