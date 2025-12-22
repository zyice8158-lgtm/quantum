import { fa } from 'element-plus/es/locales.mjs';
import { defineComponent } from 'vue';
// import { useLocale } from '@/hooks/i18n'
// import LanguageSwitcher from '@/components/LanguageSwitcher.vue'


export default defineComponent({
    props: {
        icon: {
            type: Function,
            required: false
        },
        title: {
            type: String,
            required: true
        },
        subTitle: {
            type: String,
            required: false
        },
        id: {
            type: String,
            required: false
        }
    }, setup(props, { slots }) {
        const Icon = props.icon
        // const { t, locale } = useLocale()
        console.log(props);

        return () => (
            <div id={props.id} class={'bg-surface p-[16px] text-text-on-surface  rounded-[12px] border-[1px] border-line-window'}>

                {slots.header?.() ||
                    <div class={'title-m  mb-[12px] flex items-center gap-[8px]'}>
                        <Icon></Icon>  {props.title}
                    </div>
                }


                <div class={'bold-m mb-[12px]'}>
                    {props.subTitle}
                </div>
                {slots.default?.()}
            </div>
        );
    }

});
