import { defineComponent } from "vue";
import Wrap from "./index.vue";

export default defineComponent({
  name: "CreatorZone",
  setup() {
    return () => (
      <div style={{ height: "100%" }}>
        <Wrap />
      </div>
    );
  },
});
