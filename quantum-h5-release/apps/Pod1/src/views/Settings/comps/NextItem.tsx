import { defineComponent } from 'vue';
import { useLocale } from '@/hooks/i18n'
import { IconArrowRight } from '@quantum/icons';
// import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
// import { QSearchInput } from '@libs/p-comps'

export default defineComponent({
    props: {
        // title: {
        //     type: String,
        //     required: true
        // },
        // target: {
        //     type: String,
        //     // required: true
        // }
    }, setup(props, { slots }) {

        const { t, locale } = useLocale()
        console.log(props);

        return () => (
            <div role="button" tabindex="0" class="cursor-pointer title-l h-[48px] flex items-center justify-between border-b rounded-4 border-focus-container">
                {slots.default?.()}
                <IconArrowRight></IconArrowRight>

            </div>
        );
    }

});