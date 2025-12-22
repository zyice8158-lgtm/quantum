import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Agents',
  setup() {
    return () => (
      <div class="p-[8px]">
        <h1 class="text-2xl font-bold mb-[8px]">Agents</h1>
        <p>This is the Agents page component.</p>
      </div>
    );
  }
});
