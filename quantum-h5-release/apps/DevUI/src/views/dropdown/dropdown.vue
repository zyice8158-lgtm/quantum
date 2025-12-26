<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div class="page-container">
        <h1 class="text-2xl font-bold mb-6">Dropdown Button</h1>

        <!-- Basic Import -->
        <p class="mt-[20px] mb-[10px]">Basic Import</p>
        <div class="card">
            <showCode :code="importCode" />
        </div>

        <!-- Red Dropdown Button -->
        <p class="mt-[20px] mb-[10px]">Red Dropdown Button</p>
        <section class="section-box">
            <button class="dropdown-btn-red" @click="toggleMenu">
                <IconAdd class="btn-icon-left" />
                <span class="btn-label">Label</span>
                <IconArrowDown class="btn-icon-right" :class="{ 'rotated': isOpen }" />
            </button>
            <!-- Dropdown Menu -->
            <div v-if="isOpen" class="dropdown-menu">
                <div class="dropdown-item" @click="handleSelect('Option 1')">Option 1</div>
                <div class="dropdown-item" @click="handleSelect('Option 2')">Option 2</div>
                <div class="dropdown-item" @click="handleSelect('Option 3')">Option 3</div>
            </div>
        </section>
        <div class="card mt-5 mb-5">
            <showCode :code="redButtonCode" />
        </div>

        <!-- Props -->
        <p class="mt-[20px] mb-[10px]">Props</p>
        <div class="card">
            <showCode :code="propsCode" lang="typescript" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import showCode from '../components/showCode.vue';
import { IconAdd, IconArrowDown } from '@quantum/icons';

const isOpen = ref(false);

const toggleMenu = () => {
    isOpen.value = !isOpen.value;
};

const handleSelect = (option: string) => {
    console.log('Selected:', option);
    isOpen.value = false;
};

const importCode = `import { IconAdd, IconArrowDown } from '@quantum/icons';`;

const redButtonCode = `<button class="dropdown-btn-red" @click="toggleMenu">
    <IconAdd class="btn-icon-left" />
    <span class="btn-label">Label</span>
    <IconArrowDown class="btn-icon-right" :class="{ 'rotated': isOpen }" />
</button>`;

const propsCode = `interface DropdownButtonProps {
    label?: string;         // Button label text
    icon?: string;          // Left icon
    showChevron?: boolean;  // Show dropdown chevron
    disabled?: boolean;     // Disabled state
    color?: string;         // Button color variant
}`;
</script>

<style scoped>
.card {
    width: 80%;
}

.section-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-outlines-outline-variant);
    border-radius: 0.75rem;
    padding: 2rem;
    max-width: 64rem;
    position: relative;
}

/* Red Dropdown Button */
.dropdown-btn-red {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1.5rem;
    background-color: #A33A3A;
    color: #ffffff;
    border: none;
    border-radius: 2rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 140px;
}

.dropdown-btn-red:hover {
    background-color: #8B3232;
}

.dropdown-btn-red:active {
    background-color: #722929;
}

.btn-icon-left {
    font-size: 1.25rem;
    line-height: 1;
}

.btn-label {
    flex: 1;
    text-align: center;
}

.btn-icon-right {
    font-size: 1rem;
    transition: transform 0.2s ease;
    transform: rotate(180deg);
}

.btn-icon-right.rotated {
    transform: rotate(0deg);
}

/* Dropdown Menu */
.dropdown-menu {
    position: absolute;
    top: calc(100% - 1rem);
    background-color: var(--color-surface, #ffffff);
    border: 1px solid var(--color-outlines-outline-variant, #e5e7eb);
    border-radius: 0.75rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    min-width: 140px;
    overflow: hidden;
    z-index: 100;
}

.dropdown-item {
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background-color 0.15s ease;
    color: var(--color-text-on-surface, #1f2937);
}

.dropdown-item:hover {
    background-color: var(--color-primary-container, #f3e8ff);
    color: var(--color-primary-primary, #6C43C6);
}
</style>
