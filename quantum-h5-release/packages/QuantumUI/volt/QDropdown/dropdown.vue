<template>
    <Button
        unstyled
        :pt="theme"
        :ptOptions="{ mergeProps: ptViewMerge }"
    >
        <template v-for="(_, slotName) in $slots" v-slot:[slotName]="slotProps">
            <slot :name="slotName" v-bind="slotProps ?? {}" />
        </template>
    </Button>
</template>

<script setup lang="ts">
import Button, { type ButtonPassThroughOptions, type ButtonProps } from 'primevue/button';
import { ref, computed } from 'vue';
import { ptViewMerge } from '../utils';
import './dropdown.less';

interface Props extends /* @vue-ignore */ ButtonProps {
    variant?: 'default' | 'outlined' | 'text';
    size?: 'small' | 'medium' | 'large';
    rounded?: boolean;
    raised?: boolean;
    iconOnly?: boolean;
    vertical?: boolean;
    fluid?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
    size: 'medium',
    rounded: false,
    raised: false,
    iconOnly: false,
    vertical: false,
    fluid: false
});

// Generate corresponding class names based on props
const rootClasses = computed(() => {
    const classes = ['q-dropdown'];

    // Variant Style
    if (props.variant === 'outlined') {
        classes.push('q-dropdown-outlined');
    } else if (props.variant === 'text') {
        classes.push('q-dropdown-text');
    }

    // Size Style
    if (props.size === 'small') {
        classes.push('q-dropdown-small');
    } else if (props.size === 'large') {
        classes.push('q-dropdown-large');
    }

    // Other Variants
    if (props.rounded) classes.push('q-dropdown-rounded');
    if (props.raised) classes.push('q-dropdown-raised');
    if (props.iconOnly) classes.push('q-dropdown-icon-only');
    if (props.vertical) classes.push('q-dropdown-vertical');
    if (props.fluid) classes.push('q-dropdown-fluid');

    return classes.join(' ');
});

const theme = ref<ButtonPassThroughOptions>({
    root: {
        class: rootClasses
    },
    loadingIcon: {
        class: 'q-dropdown-loading-icon'
    },
    icon: {
        class: 'q-dropdown-icon'
    },
    label: {
        class: 'q-dropdown-label'
    },
    pcBadge: {
        root: {
            class: 'q-dropdown-badge'
        }
    }
});
</script>
