import { defineComponent } from 'vue';

export default defineComponent({
  name: 'RacecarOnTheMoon',
  setup() {
    return () => (
      <div class="p-[8px]">
        <h1 class="text-2xl font-bold mb-[8px]">Racecar On The Moon</h1>
        <p>This is the Racecar On The Moon page component.</p>
      </div>
    );
  }
});
