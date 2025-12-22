import { closeWindow, startDragWindow } from "@/store/window";
import { IconMini } from "@quantum/icons";
import { defineComponent, PropType, ref, onMounted } from "vue";
import { AiButton } from "@libs/p-comps/volt/QButton";

const MiniWinHeader = defineComponent({
  name: 'MiniWinHeader',
  props: {
    onClose: {
      type: Function as PropType<() => void | Promise<void>>,
      default: null
    }
  },
  setup(props, { slots }){
    const onClick = () => {
      if (props.onClose) {
        props.onClose();
        closeWindow();
      } else {
        closeWindow();
      }
    }
    return ()=>{
      return <div class="w-full h-[32px] flex justify-between" onMousedown={startDragWindow}>
        <div>{slots.headerLeft?.()}</div>
        <div class="flex items-center">
          <AiButton size="small" category="actions" onClick={onClick} v-automation="minimize_btn">
            <IconMini />
          </AiButton>
        </div>
      </div>
    }
  }
})

export default defineComponent({
  name: 'MiniWin',
  props: {
    onClose: {
      type: Function as PropType<() => void | Promise<void>>,
      default: null
    }
  },
  setup(props, { slots, expose }){
    const rootRef = ref<HTMLDivElement | null>(null);

    onMounted(() => {
      if (rootRef.value) {
        expose({
          $el: rootRef.value
        });
      }
    });

    return ()=>{
      return <div ref={rootRef} class="acrylic-view pt-[8px] pb-[4px] px-[16px] rounded-[32px] flex flex-col h-full">
        <MiniWinHeader class="flex-none mb-[8px]" onClose={props.onClose} />
        <div class="flex-1 min-h-0 overflow-hidden">{slots.default?.()}</div>
      </div>
    }
  }
});
