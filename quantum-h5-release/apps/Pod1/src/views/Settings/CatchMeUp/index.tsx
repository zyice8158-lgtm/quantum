import { defineComponent } from "vue";
import Wrap from "./main.vue";

export default defineComponent({
  name: "CmuDevice",
  setup() {
    return () => (
      <div style={{ height: "100%" }}>
        <Wrap />
      </div>
    );
  },
});
