const automation = {

    mounted(el: HTMLElement, binding: { value: string }) {
        el.setAttribute('automation-id', binding.value)
    }


}
export default automation