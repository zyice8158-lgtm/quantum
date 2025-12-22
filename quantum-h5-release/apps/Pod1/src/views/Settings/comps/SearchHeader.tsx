import { defineComponent } from 'vue';
import { useLocale } from '@/hooks/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { QSearchInput } from '@libs/p-comps'

export default defineComponent({
    props: {
        title: {
            type: String,
            required: true
        },
        subTitle: {
            type: String,
            required: true
        }
    }, setup(props) {

        const { t, locale } = useLocale()
        console.log(props);

        return () => (
            <div class="mb-[12px]">
                <h1 class="title-xl mb-[8px] text-text-on-surface ">{props.title}</h1>
                <h2 class="body-s mb-[12px] text-text-on-surface ">{props.subTitle}</h2>

            </div>
        );
    }

});
