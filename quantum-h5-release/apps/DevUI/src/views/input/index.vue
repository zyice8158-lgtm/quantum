<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="page-container">
    <h1 class="text-2xl font-bold mb-6">Input</h1>

    <!-- Basic Import -->
    <p class="mt-[20px] mb-[10px]">Basic Import</p>
    <div class="card">
      <showCode :code="importCode" />
    </div>

    <!-- Basic Input -->
    <p class="mt-[20px] mb-[10px]">Basic</p>
    <p class="text-sm text-gray-500 mb-2">InputText is used with the v-model property for two-way value binding.</p>
    <section class="section-box">
      <InputText v-model="basicValue" class="basic-input" />
    </section>
    <div class="card mt-5 mb-5">
      <showCode :code="basicCode" />
    </div>

    <!-- Float Label Input -->
    <p class="mt-[20px] mb-[10px]">Float Label Input</p>
    <section class="section-box">
      <div class="float-input-wrapper">
        <label class="float-label">Label</label>
        <input v-model="inputValue" type="text" class="float-input" placeholder="Placeholder text" />
      </div>
    </section>
    <div class="card mt-5 mb-5">
      <showCode :code="floatLabelCode" />
    </div>

    <!-- Float Label Input - Filled -->
    <p class="mt-[20px] mb-[10px]">Float Label Input - Filled</p>
    <section class="section-box">
      <div class="float-input-wrapper">
        <label class="float-label">Label</label>
        <input v-model="filledValue" type="text" class="float-input" />
      </div>
    </section>
    <div class="card mt-5 mb-5">
      <showCode :code="filledCode" />
    </div>

    <!-- Props / Slots / Events -->
    <p class="mt-[20px] mb-[10px]">Props</p>
    <div class="card">
      <showCode :code="propsCode" lang="typescript" />
    </div>
    <p class="mt-[20px] mb-[10px]">Slots</p>
    <div class="card">
      <showCode :code="slotsCode" />
    </div>
    <p class="mt-[20px] mb-[10px]">Events</p>
    <div class="card">
      <showCode :code="eventsCode" lang="typescript" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import showCode from '../components/showCode.vue';
import InputText from 'primevue/inputtext';

const basicValue = ref('');
const inputValue = ref('');
const filledValue = ref('Input text');

const importCode = `import InputText from 'primevue/inputtext';`;

const basicCode = `<InputText v-model="value" />`;

const floatLabelCode = `<QInput v-model="value" label="Label" placeholder="Placeholder text" />`;

const filledCode = `<QInput v-model="value" label="Label" />
// value = 'Input text'`;

const propsCode = `interface InputTextProps {
  modelValue?: string;    // Input value (v-model)
  placeholder?: string;   // Placeholder text
  disabled?: boolean;     // Disabled state
  size?: 'small' | 'large';  // Input size
  invalid?: boolean;      // Invalid state
}`;

const slotsCode = `// InputText does not have slots`;

const eventsCode = `focus, blur, input, change, 'update:modelValue'`;
</script>

<style scoped>
.card {
  width: 80%;
}

.section-box {
  display: flex;
  justify-content: center;
  border: 1px solid var(--color-outlines-outline-variant);
  border-radius: 0.75rem;
  padding: 2rem;
  max-width: 64rem;
}

/* Basic InputText Style*/
.basic-input {
  width: 250px;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--color-primary-container);
  border-radius: 0.5rem;
  font-size: 1rem;
  color: var(--color-text-on-surface);
  background-color: var(--color-surface);
  transition: all 0.2s ease;
}

.basic-input:hover {
  border-color: var(--color-primary-primary);
}

.basic-input:focus {
  border-color: var(--color-primary-primary);
  box-shadow: 0 0 0 2px var(--color-state-primary-primary-hover);
  outline: none;
}

/*Floating Label Input Container */
.float-input-wrapper {
  position: relative;
  width: 320px;
  min-height: 56px;
  background-color: #F5F3F7;
  border: 1.5px solid var(--color-primary-container);
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem 0.5rem 1rem;
}

.float-input-wrapper:hover {
  border-color: var(--color-primary-primary);
}

.float-input-wrapper:focus-within {
  border-color: var(--color-primary-primary);
  box-shadow: 0 0 0 2px var(--color-state-primary-primary-hover);
}

/* Floating Label - Always on Top */
.float-label {
  font-size: 0.75rem;
  color: var(--color-primary-primary);
  line-height: 1;
  margin-bottom: 0.25rem;
}

/* 输入框 */
.float-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1rem;
  color: var(--color-text-on-surface);
  padding: 0;
  line-height: 1.5;
}

.float-input::placeholder {
  color: var(--color-text-on-surface-variant);
}
</style>
