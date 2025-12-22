import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LasVegasItinerary',
  setup() {
    return () => (
      <div class="p-[8px]">
        <h1 class="text-2xl font-bold mb-[8px]">Las Vegas Itinerary</h1>
        <p>This is the Las Vegas Itinerary page component.</p>
      </div>
    );
  }
});
