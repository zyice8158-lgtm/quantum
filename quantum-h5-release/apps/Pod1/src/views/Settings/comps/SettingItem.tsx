// import { fa } from 'element-plus/es/locales.mjs';
import { defineComponent, ref, watch } from 'vue';
// import { useLocale } from '@/hooks/i18n'
// import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ToggleSwitch from '@libs/p-comps/volt/ToggleSwitch.vue';

export default defineComponent({

    props: {

        title: {
            type: String,
            required: true
        },
        subTitle: {
            type: String,
            required: false
        },
        val: {
            type: Boolean,
            required: false
        },
        isColumn: {
            type: Boolean,
            required: false,
            default: false
        },
        isChild: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    emits: {
        'update:val': (value: boolean) => true,
        'change': (item: { title: string; val: boolean }) => true
    },
    setup(props, { slots, emit }) {
        const value = ref(props.val ?? false);
        watch(() => props.val, (newVal) => {
            if (newVal !== undefined) {
                value.value = newVal;
            }
        });
        const handleChange = () => {
            console.log('change', props.title, value.value);
            emit('update:val', value.value)
            emit('change', { title: props.title, val: value.value })
        }
        return () => (
            <div class={props.isColumn ? '' : 'flex justify-between items-center'}>
                <div>

                    <div class={props.isChild ? 'title-xs' : 'title-m'}>
                        {props.title}
                    </div>
                    <div class={'text-[12px] text-text-sub  mb-[12px]'}>
                        {props.subTitle}
                    </div>
                </div>
                <div >
                    {slots.default?.() ||
                        <ToggleSwitch v-model={value.value} onChange={handleChange}></ToggleSwitch>
                    }
                </div>

            </div>
        );
    }

});