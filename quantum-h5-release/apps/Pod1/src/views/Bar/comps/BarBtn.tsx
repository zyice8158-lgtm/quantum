import { defineComponent } from "vue";
import { AiButton, type AiBtnProps } from "@libs/p-comps/volt/QButton";
import { stopModifiers } from "@/store/window";

export default defineComponent<AiBtnProps>({
  name: "BarBtn",
  props:{
    isActive: {
      type: Boolean,
      required: false
    }
  },
  emits: ["activeChange", "update:isActive"],
  setup(props, { emit, slots }) {
    const onActiveChange = () => {
      const nextActive = !props.isActive;
      emit("activeChange", nextActive);
      emit("update:isActive", nextActive);
    };
    return () => (
      <AiButton isActive={props.isActive} class="" onClick={onActiveChange} onMousedown={stopModifiers()} v-slots={slots}></AiButton>
    );
  },
});
