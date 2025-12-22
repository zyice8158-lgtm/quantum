<template>
  <div class="card">
    <showCode :code="importStr"> </showCode>
    <!-- <p>* dark 用于黑白切换，默认是白字黑底 dark:true 时为黑字白底 会根据暗色模式自动切换</p> -->
  </div>
  <Toast position="top-left" group="tl" />
  <Toast position="top-center" group="tc" />
  <Toast position="top-right" group="tr" />
  <Toast position="bottom-left" group="bl" />
  <Toast position="bottom-right" group="br" />
  <Toast position="bottom-center" group="bc" />
  <Toast position="center" group="c" />
  <!-- <div class="card flex flex-wrap gap-2 justify-center"> -->
  <QButton label="Top Left" @click="showTopLeft" />
  <div class="card">
    <showCode :code="code1"> </showCode>
  </div>
  <QButton label="Top Center" @click="showTopCenter" />
  <div class="card">
    <showCode :code="code2"> </showCode>
  </div>
  <QButton label="Top Right" @click="showTopRight" />
  <div class="card">
    <showCode :code="code3"> </showCode>
  </div>
  <QButton label="Bottom Left" @click="showBottomLeft" />
  <div class="card">
    <showCode :code="code4"> </showCode>
  </div>
  <QButton label="Bottom Center" @click="showBottomCenter" />
  <div class="card">
    <showCode :code="code5"> </showCode>
  </div>
  <QButton label="Bottom Right" @click="showBottomRight" />
  <div class="card">
    <showCode :code="code6"> </showCode>
  </div>
  <QButton label="Center" @click="showCenter" />
  <div class="card">
    <showCode :code="code7"> </showCode>
  </div>
  <!-- </div> -->
  <!-- </div> -->
</template>

<script setup lang="ts">
import Toast from "@libs/p-comps/volt/QToast/index.vue";
import { useToast } from "primevue/usetoast";
import { QButton } from "@libs/p-comps/volt/QButton";
import showCode from "../components/showCode.vue";
const toast = useToast();
const importStr = `import Toast from "@libs/p-comps/volt/QToast/index.vue";
import { useToast } from "primevue/usetoast";
import { QButton } from "@libs/p-comps/volt/QButton";
const toast = useToast();
`
console.log(toast);
const showTopLeft = () => {
  toast.add({ detail: 'Message Content', group: 'tl', life: 3000 });
};

const showBottomLeft = () => {
  toast.add({ detail: 'Message Content', group: 'bl', life: 3000 });
};

const showBottomRight = () => {
  toast.add({ detail: 'Message Content', group: 'br', life: 3000 });
};

const showCenter = () => {
  toast.add({ detail: 'Message Content', group: 'c', life: 3000 });
};

const showTopCenter = () => {
  toast.add({ detail: 'Message Content', group: 'tc', life: 3000000 });
};
const showTopRight = () => {
  toast.add({ detail: 'Message Content', group: 'tr', life: 3000 });
};

const showBottomCenter = () => {
  toast.add({ detail: 'Message Content', group: 'bc', life: 3000 });
};

const code1 = `template
<Toast position="top-left" group="tl" /><QButton label="Top Left" @click="showTopLeft" />
script
const showTopLeft = () => {
    toast.add({  detail: 'Message Content', group: 'tl', life: 3000 });
};
`
const code2 = `template
 <Toast position="top-center" group="tc" /> <QButton label="Top Center" @click="showTopCenter" />
script
const showTopCenter = () => {
    toast.add({  detail: 'Message Content', group: 'tc', life: 3000 });
};
`
const code3 = `template
<Toast position="top-right" group="tr" /> <QButton label="Top Right" @click="showTopRight" />
script
const showTopRight = () => {
    toast.add({  detail: 'Message Content', group: 'tr', life: 3000 });
};
`
const code4 = `template
<Toast position="bottom-left" group="bl"  /><QButton label="Bottom Left" @click="showBottomLeft" />
script
const showBottomLeft = () => {
    toast.add({  detail: 'Message Content', group: 'bl', life: 3000 });
};
`
const code5 = `template
<Toast position="bottom-center" group="bc"  /><QButton label="Bottom Center" @click="showBottomCenter" />
script
const showBottomCenter = () => {
    toast.add({  detail: 'Message Content', group: 'bc', life: 3000 });
};
`
const code6 = `template
<Toast position="bottom-right" group="br"  /><QButton label="Bottom Right" @click="showBottomRight" />
script
const showBottomRight = () => {
    toast.add({  detail: 'Message Content', group: 'br', life: 3000 });
};
`
const code7 = `template
<Toast position="center" group="c"  /><QButton label="Center" @click="showCenter" />
script
const showCenter = () => {
    toast.add({  detail: 'Message Content', group: 'c', life: 3000 });
};
`
</script>

<style scoped>
.card {
  padding: 10px;
  width: 80%;
}
</style>
