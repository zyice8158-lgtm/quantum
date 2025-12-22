<script setup lang="ts">
import { QButton, QIconButton, AiButton } from "@libs/p-comps/volt/QButton/index.tsx";

import showCode from "../components/showCode.vue";
// import ArrowDownIcon from '@primevue/icons/arrowdown';
import { ref } from "vue";
import { IconAdd } from "@quantum/icons";
const loadingFlag = ref(true);
// import { IconLoading } from "@quantum/icons";
const categoryFlag = ref(false);
const categoryTester = `script
const categoryFlag = ref(false)
vue
<AiButton :category="categoryFlag ? 'primary' : ''" @click="categoryFlag = !categoryFlag"><IconAdd class="w-[24px] h-[24px]" /></AiButton> <AiButton :category="categoryFlag ? 'chat' : ''" @click="categoryFlag = !categoryFlag"><IconAdd class="w-[24px] h-[24px]" /></AiButton>`;

// Define code strings for showCode components
const importCode = "import {  QButton, QIconButton, AiButton } from '@libs/p-comps/volt/QButton';";

const sizeCode = `      <QButton size="large">large</QButton>      <QButton>default</QButton>      <QButton size="small">small</QButton>`;

const configurationCode = `        import { IconAdd } from "@quantum/icons";
        import { ref } from "vue";
         const loadingFlag = ref(true);
         <template>        <QButton variant="text" icon="IconLoading">label</QButton>        <QButton variant="link">default</QButton>        <QButton label="Icon Left"><template #icon><IconAdd /></template></QButton>        <QButton iconPos="right">Icon Right<template #icon><IconAdd /></template></QButton>        <QButton :loading="loadingFlag" label="loading"></QButton>      </template>`;

const colorCode = `<QButton color="error">error</QButton> <QButton color="neutral">neutral</QButton> <QButton color="primary">primary</QButton> <QButton color="chat">chat</QButton> <QButton color="chat" label="chat"><template #icon><IconAdd /></template></QButton> <QButton color="chat" label="chat" disabled><template #icon><IconAdd /></template></QButton>`;

const containerCode = `    <QButton variant="filled">Filled</QButton>    <QButton color="error" variant="outlined">Outlined</QButton>    <QButton color="primary" variant="outlined">Outlined</QButton>    <QButton variant="outlined">Outlined</QButton>    <QButton color="secondary" >secondary</QButton>      `;

const iconButtonCode = `    <QIconButton color="primary"><IconAdd /></QIconButton>    <QIconButton><IconAdd /></QIconButton>    <QIconButton color="error"><IconAdd /></QIconButton>    <QIconButton color="error" variant="outlined"><IconAdd /></QIconButton>  <QIconButton color="gray"><IconAdd /></QIconButton>  `;
const aibtuttonStr = `<AiButton class="!text-ai !bg-[var(--color-surfaces-surface-blur-high)]"><IconAdd /></AiButton> <AiButton><IconAdd /></AiButton> <AiButton category="primary"><IconAdd /></AiButton> <AiButton category="error"><IconAdd /></AiButton> <AiButton class="!bg-[red] !text-[#fff] !w-[45px] !h-[45px]"><IconAdd class="w-[24px] h-[24px]" /></AiButton> <AiButton disabled><IconAdd /></AiButton> <AiButton category="chat"><IconAdd /></AiButton> <AiButton category="chat" disabled><IconAdd class="text-[#fff]" /></AiButton>`;
</script>
<template>
  <div class="p-[20px]">
    <p>Basic</p>
    <div class="card">
      <showCode :code="importCode"> </showCode>
    </div>
    <p class="mt-[20px] mb-[10px]">Large, Medium, Small</p>
    <div class="">
      <ul class="flex gap-[10px] mb-[20px] items-bottom">
        <li><QButton size="large">large</QButton></li>
        <li><QButton size="normal">default</QButton></li>
        <li><QButton size="small">small</QButton></li>
      </ul>
    </div>

    <div>
      <showCode class="card" :code="sizeCode"> </showCode>
    </div>
    <p class="mt-[20px] mb-[10px]">Configuration</p>
    <p class="mt-[20px] mb-[10px]">Text,Link, Icon Left, Icon Right,loading</p>

    <ul class="flex gap-[10px] items-bottom">
      <li><QButton variant="text">Text</QButton></li>
      <li><QButton color="primary" variant="text">Text</QButton></li>
      <li><QButton color="error" variant="text">Text</QButton></li>

      <li>
        <QButton color="error" label="Icon Left">
          <template #icon>
            <IconAdd />
          </template>
        </QButton>
      </li>
      <li>
        <QButton iconPos="right" label="Icon Right">
          <template #icon>
            <IconAdd />
          </template>
        </QButton>
      </li>
      <li><QButton :loading="loadingFlag" label="loading"></QButton></li>
      <li>
        <QButton variant="link" to="/lists/index">link</QButton
        ><span class="text-[red]">(* 需求暂未明确to属性已经被注释)</span>
      </li>
      <li><QButton disabled>disabled</QButton></li>
    </ul>
    <div class="mt-[20px] mb-[20px]">
      <showCode class="card" :code="configurationCode"> </showCode>
    </div>
    <p class="mt-[20px] mb-[10px]">color</p>
    <div>
      <ul class="flex gap-[10px] items-bottom">
        <li><QButton color="error">error</QButton></li>
        <li><QButton color="neutral">neutral</QButton></li>
        <li><QButton color="primary">primary</QButton></li>
        <li><QButton color="chat">chat</QButton></li>
        <li>
          <QButton color="chat" label="chat">
            <template #icon>
              <IconAdd />
            </template>
          </QButton>
        </li>
        <li>
          <QButton color="chat" label="chat" disabled>
            <template #icon>
              <IconAdd />
            </template>
          </QButton>
        </li>
      </ul>
    </div>
    <div class="mt-[20px] mb-[20px]">
      <showCode class="w-[600px]" :code="colorCode"> </showCode>
    </div>
    <p class="mt-[20px] mb-[10px]">Container</p>
    <div class="w-[600px]">
      <ul class="flex gap-[10px] items-bottom">
        <li><QButton variant="filled">Filled</QButton></li>
        <li><QButton color="error" variant="outlined">Outlined</QButton></li>
        <li><QButton color="primary" variant="outlined">Outlined</QButton></li>
        <li><QButton variant="outlined">Outlined</QButton></li>
        <li><QButton color="secondary">secondary</QButton></li>
      </ul>
    </div>
    <div class="mt-[20px] mb-[20px]">
      <showCode class="card" :code="containerCode"> </showCode>
    </div>
    <p class="mt-[20px] mb-[10px]">icon</p>
    <div class="w-[600px]">
      <ul class="flex gap-[10px] items-bottom">
        <li>
          <QIconButton color="primary">
            <IconAdd />
          </QIconButton>
        </li>
        <li>
          <QIconButton>
            <IconAdd />
          </QIconButton>
        </li>
        <li>
          <QIconButton color="error">
            <IconAdd />
          </QIconButton>
        </li>
        <li>
          <QIconButton color="error" variant="outlined">
            <IconAdd />
          </QIconButton>
        </li>
        <li>
          <QIconButton color="gray">
            <IconAdd />
          </QIconButton>
        </li>
      </ul>
    </div>
    <div class="mt-[20px] mb-[20px]">
      <showCode class="card" :code="iconButtonCode"> </showCode>
    </div>
    <div class="mt-[20px] mb-[20px]">
      <div class="w-[600px]">
        <ul class="flex gap-[10px] items-bottom">
          <li>
            <AiButton class="!text-ai !bg-[var(--color-surfaces-surface-blur-high)]">
              <IconAdd />
            </AiButton>
          </li>
          <li>
            <AiButton>
              <IconAdd />
            </AiButton>
          </li>
          <li>
            <AiButton category="primary">
              <IconAdd />
            </AiButton>
          </li>
          <li>
            <AiButton category="error">
              <IconAdd />
            </AiButton>
          </li>
          <li>
            <AiButton class="!bg-[red] !text-[#fff] !w-[45px] !h-[45px]">
              <IconAdd class="w-[24px] h-[24px]" />
            </AiButton>
          </li>
          <li>
            <AiButton disabled>
              <IconAdd />
            </AiButton>
          </li>
          <li>
            <AiButton category="chat">
              <IconAdd />
            </AiButton>
          </li>
          <li>
            <AiButton category="chat" disabled>
              <IconAdd class="text-[#fff]" />
            </AiButton>
          </li>
        </ul>
      </div>
    </div>
    <div>
      <showCode class="card" :code="aibtuttonStr"> </showCode>
    </div>
    <div class="my-[10px]">测试 category 切换</div>
    <div class="mt-[20px] mb-[20px]">
      <div class="w-[600px]">
        <ul class="flex gap-[10px] items-bottom mb-[20px]">
          <li>
            <AiButton
              :category="categoryFlag ? 'primary' : ''"
              @click="categoryFlag = !categoryFlag"
            >
              <IconAdd class="w-[24px] h-[24px]" />
            </AiButton>
          </li>
          <li>
            <AiButton :category="categoryFlag ? 'chat' : ''" @click="categoryFlag = !categoryFlag">
              <IconAdd class="w-[24px] h-[24px]" />
            </AiButton>
          </li>
        </ul>
      </div>
      <div>
        <showCode class="card" :code="categoryTester"> </showCode>
      </div>
    </div>
  </div>
</template>
<style scoped>
.card {
  width: 80%;
}
</style>
