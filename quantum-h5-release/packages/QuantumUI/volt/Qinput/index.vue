<template>
    <div class="q-input-wrapper" :class="wrapperClasses">
        <label v-if="label" class="q-input-label">{{ label }}</label>
        <InputText
            unstyled
            :pt="theme"
            :ptOptions="{ mergeProps: ptViewMerge }"
            :placeholder="placeholder"
            :disabled="disabled"
            :value="modelValue"
            @input="handleInput"
            @focus="handleFocus"
            @blur="handleBlur"
        />
    </div>
</template>

<script setup lang="ts">
import InputText, { type InputTextPassThroughOptions, type InputTextProps } from 'primevue/inputtext';
import { ref, computed } from 'vue';
import { ptViewMerge } from '../utils';
import './input.less';

interface Props extends /* @vue-ignore */ Omit<InputTextProps, 'modelValue'> {
    label?: string;
    placeholder?: string;
    modelValue?: string;
    disabled?: boolean;
    error?: boolean;
    variant?: 'outlined' | 'filled' | string;
}

const props = withDefaults(defineProps<Props>(), {
    label: '',
    placeholder: '',
    modelValue: '',
    disabled: false,
    error: false,
    variant: 'outlined'
});

const emit = defineEmits<{
    'update:modelValue': [value: string];
    focus: [event: FocusEvent];
    blur: [event: FocusEvent];
}>();

const isFocused = ref(false);

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.value);
};

const handleFocus = (event: FocusEvent) => {
    isFocused.value = true;
    emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
    isFocused.value = false;
    emit('blur', event);
};

// Generate wrapper class names based on states
const wrapperClasses = computed(() => {
    return {
        'q-input-focused': isFocused.value,
        'q-input-has-value': !!props.modelValue,
        'q-input-disabled': props.disabled,
        'q-input-error': props.error,
        [`q-input-${props.variant}`]: true
    };
});

const theme = ref<InputTextPassThroughOptions>({
    root: {
        class: 'q-input-field'
    }
});
</script>
