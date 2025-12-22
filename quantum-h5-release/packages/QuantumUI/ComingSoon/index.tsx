import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ComingSoon',
    setup() {
        return () => (
            <div class="flex h-full w-full justify-center items-center">
                <h1 class="text-2xl font-bold">Coming Soon</h1>
            </div>
        );
    }
});