<template>
  <div class="card">
    <div class="mb-[20px] ">
      <showCode :code="importCode" lang="javascript"></showCode>
    </div>
    <div ref="u1">
      <ul class="flex flex-wrap gap-4">
        <li>
          <QSplitButton label="default" :model="items" size="small" @click="save" outlined>
            <template #icon>
              <IconAdd></IconAdd>
            </template>
            <template #dropdownicon>
              <IconAdd></IconAdd>
            </template>
          </QSplitButton>
        </li>
        <li>
          <QSplitButton label="secondary" :model="items" @click="save" outlined severity="secondary"></QSplitButton>
        </li>
        <li>
          <QSplitButton size="large" label="success" :model="items" @click="save" outlined severity="success">
          </QSplitButton>
        </li>
        <li>
          <QSplitButton label="info" :model="items" @click="save" outlined severity="info"></QSplitButton>
        </li>
        <li>
          <QSplitButton label="warn" :model="items" @click="save" outlined severity="warn"></QSplitButton>
        </li>
        <li>
          <QSplitButton label="help" :model="items" @click="save" outlined severity="help"></QSplitButton>
        </li>
        <li>
          <QSplitButton label="danger" :model="items" @click="save" outlined severity="danger"></QSplitButton>
        </li>
        <li>
          <QSplitButton label="contrast" :model="items" @click="save" outlined severity="contrast"></QSplitButton>
        </li>
      </ul>
    </div>
    <div class="mb-[20px] " v-if="content['u1']">
      <showCode :code="content['u1']" lang="html"></showCode>
    </div>
    <div class="card" ref="u2">
      <ul class="flex flex-wrap gap-4">
        <li>
          <QSplitButton label="Save" :model="items"  size="small"></QSplitButton>
        </li>
        <li>
          <QSplitButton label="Save" :model="items" ></QSplitButton>
        </li>
        <li>
          <QSplitButton label="Save" :model="items"  size="large"></QSplitButton>
        </li>
      </ul>
    </div>
    <div class="mb-[20px]">
      <showCode v-if="content['u2']" :code="content['u2']"></showCode>
    </div>
    <div class="card" ref="u3">
      <ul class="flex flex-wrap gap-4">
        <li>
          <QSplitButton label="Save" :model="items" @click="save" ></QSplitButton>
        </li>
        <li>
          <QSplitButton label="Save" :model="items" @click="save"  severity="secondary"></QSplitButton>
        </li>
        <li>
          <QSplitButton label="Save" :model="items" @click="save"  severity="success"></QSplitButton>
        </li>
        <li>
          <QSplitButton label="Save" :model="items" @click="save"  severity="info"></QSplitButton>
        </li>
        <li>
          <QSplitButton label="Save" :model="items" @click="save"  severity="warn"></QSplitButton>
        </li>
        <li>
          <QSplitButton label="Save" :model="items" @click="save"  severity="help"></QSplitButton>
        </li>
        <li>
          <QSplitButton label="Save" :model="items" @click="save"  severity="danger"></QSplitButton>
        </li>
        <li>
          <QSplitButton label="Save" :model="items" @click="save"  severity="contrast"></QSplitButton>
        </li>
      </ul>
    </div>
    <div class="mb-[20px]">
      <showCode v-if="content['u3']" language="vue" :code="content['u3']"></showCode>
    </div>
    <div class="card" ref="u4">
      <ProgressBar :value="50"></ProgressBar>
    </div>
    <div class="mb-[20px]">
      <showCode v-if="content['u4']" :code="content['u4']"></showCode>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QSplitButton } from "@libs/p-comps/volt/QDropdown";
import ProgressBar from "@libs/p-comps/volt/ProgressBar.vue";
import { IconAdd } from "@quantum/icons";
import { ref, nextTick, watch } from "vue";
import readCode from "../components/readCode.vue";
import showCode from "../components/showCode.vue";
const importCode = `
import { QSplitButton } from "@libs/p-comps/volt/QDropdown";
const items = [
  {
    label: "Update",
    command: () => {
      console.log("Update");
    },
  },
  {
    label: "Delete",
    command: () => {
      console.log("Delete");
    },
  },
  {
    separator: true,
  },
  {
    label: "Quit",
    command: () => {
      console.log("Quit");
    },
  },
];`;

const content = ref({});

const items = [
  {
    label: "Update",
    command: () => {
      console.log("Update");
    },
  },
  {
    label: "Delete",
    command: () => {
      console.log("Delete");
    },
  },
  {
    separator: true,
  },
  {
    label: "Quit",
    command: () => {
      console.log("Quit");
    },
  },
];

content.value["u1"] = `<QSplitButton label="default" :model="items" size="small" @click="save" outlined><template #icon><IconAdd></IconAdd></template><template #dropdownicon><IconAdd></IconAdd></template></QSplitButton><QSplitButton label="secondary" :model="items" @click="save" outlined severity="secondary"></QSplitButton><QSplitButton size="large" label="success" :model="items" @click="save" outlined severity="success"></QSplitButton><QSplitButton label="info" :model="items" @click="save" outlined severity="info"></QSplitButton><QSplitButton label="warn" :model="items" @click="save" outlined severity="warn"></QSplitButton> <QSplitButton label="help" :model="items" @click="save" outlined severity="help"></QSplitButton><QSplitButton label="danger" :model="items" @click="save" outlined severity="danger"></QSplitButton><QSplitButton label="contrast" :model="items" @click="save" outlined severity="contrast"></QSplitButton>`;
content.value["u2"] = `<QSplitButton label="Save" :model="items"  size="small"></QSplitButton><QSplitButton label="Save" :model="items" ></QSplitButton><QSplitButton label="Save" :model="items"  size="large"></QSplitButton>`;
content.value['u3'] = `<QSplitButton label="Save" :model="items" @click="save" ></QSplitButton><QSplitButton label="Save" :model="items" @click="save"  severity="secondary"></QSplitButton><QSplitButton label="Save" :model="items" @click="save"  severity="success"></QSplitButton><QSplitButton label="Save" :model="items" @click="save"  severity="info"></QSplitButton><QSplitButton label="Save" :model="items" @click="save"  severity="warn"></QSplitButton><QSplitButton label="Save" :model="items" @click="save"  severity="help"></QSplitButton><QSplitButton label="Save" :model="items" @click="save"  severity="danger"></QSplitButton><QSplitButton label="Save" :model="items" @click="save"  severity="contrast"></QSplitButton>`
content.value['u4'] = `<ProgressBar :value="50"></ProgressBar>`
</script>
<style scoped lang="less">
.card {
  padding: 20px;
  width: 80%;
}
</style>
