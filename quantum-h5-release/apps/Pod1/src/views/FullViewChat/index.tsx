import { defineComponent } from "vue";
import ChatView from '@/components/ChatView/index.vue'

export default defineComponent({
  name: "FullViewChat",
  setup() {
    return () => {
      return <ChatView class="h-full px-[10px]" />
    }
  },
});
