import { defineComponent } from 'vue';
// import { personalizedContent } from '@/constant';
// import ComingSoon from '@libs/p-comps/ComingSoon';
import { RouterView } from 'vue-router';


export default defineComponent({
    name: 'Personalization',
    setup() {

        return () => (

            <div class='overflow-auto' >
                <RouterView></RouterView>
            </div>
        );
    }
}); 