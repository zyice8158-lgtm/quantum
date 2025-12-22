<template>
  <div class="card">
    <IftaLabel class="w-full md:w-200">
      <Select v-model="selectedCity" editable inputId="dd-city" :options="cities" optionLabel="name"
        class="w-full border-radius-[12px]" tabindex="0" role="button" variant="filled" />
      <label for="dd-city">City</label>
    </IftaLabel>
    <div>Selected City: {{ selectedCity }}</div>
  </div>
  <div><a href="https://primevue.org/select" target="_blank">Select 文档</a></div>
  <div class="card">
    <showCode :code="dynamicVueCode" />
  </div>
  <div class="card">
    <IfSelect label="City" v-model="selectedCity" inputId="dd-city" :options="cities" optionLabel="name"
      class="w-full border-radius-[12px]" tabindex="0" role="button" variant="filled"></IfSelect>
  </div>
  <div class="card">
    <p>* 这个组件有个独有属性 ifclass 用于设置 IftaLabel 的类名 默认值 w-full md:w-200</p>
    <showCode :code="importifStr" />
    <showCode :code="code2" />
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import Select from "@libs/p-comps/volt/QSelect/index.vue";
import IftaLabel from "primevue/iftalabel";
import showCode from "../components/showCode.vue";

import IfSelect from "@libs/p-comps/volt/QSelect/IfSelect.vue";

const selectedCity = ref("Rome");
const cities = ref([
  { name: "New York", code: "NY" },
  { name: "Rome", code: "RM" },
  { name: "London", code: "LDN" },
  { name: "Istanbul", code: "IST" },
  { name: "Paris", code: "PRS" },
]);

// 方法1：直接定义（适合无需动态拼接的场景）

// 方法2：动态拼接（如需插入变量，用 ${} 占位）
// 示例：动态修改组件路径
const selectComponentPath = "@libs/p-comps/volt/QSelect/index.vue";
const dynamicVueCode = `
<template>
  <div class="card flex justify-center">
    <IftaLabel class="w-full md:w-200">
      <Select
        v-model="selectedCity"
        inputId="dd-city"
        :options="cities"
        optionLabel="name"
        class="w-full border-radius-[12px] "
        variant="filled"
      />
      <label for="dd-city">City</label>
    </IftaLabel>
     <div>Selected City: {{ selectedCity }}</div>
  </div>
</template>
script
import { ref } from "vue";
import Select from "${selectComponentPath}";
import IftaLabel from "primevue/iftalabel";
const selectedCity = ref();
const cities = ref([
  { name: "New York", code: "NY" },
  { name: "Rome", code: "RM" },
  { name: "London", code: "LDN" },
  { name: "Istanbul", code: "IST" },
  { name: "Paris", code: "PRS" },
]);
`;
const importifStr = `import IfSelect from "@libs/p-comps/volt/QSelect/IfSelect.vue";`
const code2 = `template <IfSelect label="City" v-model="selectedCity" inputId="dd-city" :options="cities" optionLabel="name"
      class="w-full border-radius-[12px]" tabindex="0" role="button" variant="filled"></IfSelect>
      script
      const selectedCity = ref("Rome");
const cities = ref([
  { name: "New York", code: "NY" },
  { name: "Rome", code: "RM" },
  { name: "London", code: "LDN" },
  { name: "Istanbul", code: "IST" },
  { name: "Paris", code: "PRS" },
]);`
</script>
<style scoped>
.card {
  width: 80%;
}
</style>
