import { defineComponent, PropType } from "vue";

export const SwiperText = defineComponent({
  name: "SwiperText",
  props: {
    list: {
      type: Array as PropType<string[]>,
      default: () => ([]),
    },
  },
  setup() {
    return ()=>{
      return <div></div>
    }
  },
});
