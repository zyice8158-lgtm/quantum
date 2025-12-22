import { defineComponent } from "vue";
import Home from "./home/index.vue";

export default defineComponent({
  name: "LearningZone",
  setup() {
    return () => (
      <Home />
    );
  },
});
