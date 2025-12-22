import { defineComponent } from 'vue';

export default defineComponent({
  name: 'History',
  setup() {
    return () => (
      <div class="p-[8px]">
        <h1 class="text-2xl font-bold mb-[8px]">History</h1>
        <p>This is the History page component.</p>
      </div>
    );
  }
});
