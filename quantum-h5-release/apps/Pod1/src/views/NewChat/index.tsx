import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Chat',
  setup() {
    return () => (
      <div class="p-[8px]">
        <h1 class="text-2xl font-bold mb-[8px]">NewChat</h1>
        <p>This is the NewChat page component.</p>
      </div>
    );
  }
});
