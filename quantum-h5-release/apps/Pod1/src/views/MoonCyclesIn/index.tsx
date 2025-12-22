import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MoonCyclesIn',
  setup() {
    return () => (
      <div class="p-[8px]">
        <h1 class="text-2xl font-bold mb-[8px]">Moon Cycles In</h1>
        <p>This is the Moon Cycles In page component.</p>
      </div>
    );
  }
});
