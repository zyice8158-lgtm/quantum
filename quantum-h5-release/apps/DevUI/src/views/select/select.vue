<template>
    <div class="page-container">
        <h1 class="text-2xl font-bold mb-6">Select</h1>

        <!-- Basic Import -->
        <p class="mt-[20px] mb-[10px]">Basic Import</p>
        <div class="card">
            <showCode :code="importCode" />
        </div>

        <!-- Basic Select -->
        <p class="mt-[20px] mb-[10px]">Basic Select</p>
        <section class="section-box">
            <QSelect v-model="selectedCity" :options="cities" optionLabel="name" placeholder="Select a City" class="w-full md:w-56" />
        </section>
        <div class="card mt-5 mb-5">
            <showCode :code="basicCode" />
        </div>

        <!-- With Placeholder -->
        <p class="mt-[20px] mb-[10px]">With Placeholder</p>
        <section class="section-box">
            <QSelect v-model="selectedCountry" :options="countries" optionLabel="name" placeholder="Choose a Country" class="w-full md:w-56" />
        </section>
        <div class="card mt-5 mb-5">
            <showCode :code="placeholderCode" />
        </div>

        <!-- Disabled State -->
        <p class="mt-[20px] mb-[10px]">Disabled State</p>
        <section class="section-box">
            <QSelect v-model="disabledValue" :options="cities" optionLabel="name" placeholder="Disabled Select" disabled class="w-full md:w-56" />
        </section>
        <div class="card mt-5 mb-5">
            <showCode :code="disabledCode" />
        </div>

        <!-- With Filter -->
        <p class="mt-[20px] mb-[10px]">With Filter</p>
        <section class="section-box">
            <QSelect v-model="filteredCity" :options="cities" optionLabel="name" placeholder="Search Cities" filter class="w-full md:w-56" />
        </section>
        <div class="card mt-5 mb-5">
            <showCode :code="filterCode" />
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

<script setup>
import { ref } from "vue";
import QSelect from "../../../../../packages/QuantumUI/volt/QSelect/select.vue";
import showCode from '../components/showCode.vue';

const selectedCity = ref();
const selectedCountry = ref();
const disabledValue = ref();
const filteredCity = ref();

const cities = ref([
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }
]);

const countries = ref([
    { name: 'United States', code: 'US' },
    { name: 'China', code: 'CN' },
    { name: 'Japan', code: 'JP' },
    { name: 'Germany', code: 'DE' },
    { name: 'France', code: 'FR' }
]);

const importCode = `import QSelect from '@libs/p-comps/volt/QSelect/select.vue';`;

const basicCode = `<QSelect
  v-model="selectedCity"
  :options="cities"
  optionLabel="name"
  placeholder="Select a City"
/>`;

const placeholderCode = `<QSelect
  v-model="selectedCountry"
  :options="countries"
  optionLabel="name"
  placeholder="Choose a Country"
/>`;

const disabledCode = `<QSelect
  v-model="value"
  :options="options"
  optionLabel="name"
  placeholder="Disabled Select"
  disabled
/>`;

const filterCode = `<QSelect
  v-model="filteredCity"
  :options="cities"
  optionLabel="name"
  placeholder="Search Cities"
  filter
/>`;

const propsCode = `interface Props extends SelectProps {
  options: any[];           // Array of options
  optionLabel?: string;     // Property name for label
  optionValue?: string;     // Property name for value
  placeholder?: string;     // Placeholder text
  disabled?: boolean;       // Disabled state
  filter?: boolean;         // Enable filtering
  // + All PrimeVue Select props
}`;

const slotsCode = `#value        - Custom selected value display
#option       - Custom option template
#header       - Header content above options
#footer       - Footer content below options
#empty        - Content when no options
#dropdownicon - Custom dropdown icon`;

const eventsCode = `change, focus, blur, show, hide, filter, 'update:modelValue'`;
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
</style>
