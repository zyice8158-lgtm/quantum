<template>
  <div class="page-container">
    <h1 class="text-2xl font-bold mb-6">Dialog</h1>

    <!-- Basic Import -->
    <p class="mt-[20px] mb-[10px]">Basic Import</p>
    <div class="card">
      <showCode :code="importCode" />
    </div>

    <!-- Basic Dialog -->
    <p class="mt-[20px] mb-[10px]">Basic Dialog</p>
    <section class="demo-section">
      <QButton color="primary" label="Show Basic" @click="visibleBasic = true" />
      <QDialog v-model:visible="visibleBasic" modal header="Basic Dialog" size="medium">
        <p class="dialog-content-text">This is a basic dialog with default settings.</p>
        <template #footer>
          <button class="qdialog-btn qdialog-btn-cancel" @click="visibleBasic = false">Cancel</button>
          <button class="qdialog-btn qdialog-btn-save" @click="visibleBasic = false">Confirm</button>
        </template>
      </QDialog>
    </section>
    <div class="card mt-5 mb-5">
      <showCode :code="basicCode" />
    </div>

    <!-- Custom Header Dialog -->
    <p class="mt-[20px] mb-[10px]">Custom Header with Avatar</p>
    <section class="demo-section">
      <QButton color="primary" label="Show Custom Header" @click="visible = true" />
      <QDialog v-model:visible="visible" modal collapsible @collapse="collapsed = true" @expand="collapsed = false"
        @hide="handleCustomHeaderHide">
        <template #header>
          <div class="qdialog-custom-header">
            <img src="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" alt="Amy Elsner"
              class="avatar" />
            <span class="header-title">Amy Elsner</span>
          </div>
        </template>
        <template v-if="!collapsed">
          <p class="dialog-description">Update your information.</p>
          <div class="qdialog-form">
            <div class="form-row">
              <label class="form-label">Username</label>
              <input v-model="formData.username" type="text" class="form-input" />
            </div>
            <div class="form-row">
              <label class="form-label">Email</label>
              <input v-model="formData.email" type="email" class="form-input" />
            </div>
          </div>
        </template>
        <template #footer v-if="!collapsed">
          <button class="qdialog-btn qdialog-btn-cancel" @click="visible = false">Cancel</button>
          <button class="qdialog-btn qdialog-btn-save" @click="handleSave">Save</button>
        </template>
      </QDialog>
    </section>
    <div class="card mt-5 mb-5">
      <showCode :code="customHeaderCode" />
    </div>



    <!-- Slot Icons -->
    <p class="mt-[20px] mb-[10px]">Slot Icons</p>
    <section class="demo-section">
      <QButton color="primary" label="Show Slot Icons" @click="visibleSlot = true" />
      <QDialog v-model:visible="visibleSlot" modal header="Header" :closable="false" :maximizable="false"
        :collapsible="false" size="large">
        <template #icons="{ isCollapsed, isMaximized, toggleCollapse, toggleMaximize, close }">
          <button class="qdialog-icon-btn" @click="toggleCollapse()">
            <IconMini v-if="!isCollapsed" />
            <IconAdd v-else />
          </button>
          <button class="qdialog-icon-btn" @click="toggleMaximize()">
            <Icon2FullView v-if="isMaximized" />
            <IconFull v-else />
          </button>
          <button class="qdialog-close-button" @click="close()">
            <IconClose class="qdialog-close-icon" />
          </button>
        </template>
        <p class="dialog-content-text">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
        </p>
      </QDialog>
    </section>
    <div class="card mt-5 mb-5">
      <showCode :code="slotIconsCode" />
    </div>

    <!-- Size Variants -->
    <p class="mt-[20px] mb-[10px]">Size Variants</p>
    <section class="demo-section gap-4">
      <QButton color="primary" label="Small" @click="visibleSmall = true" />
      <QButton color="primary" label="Medium" @click="visibleMedium = true" />
      <QButton color="primary" label="Large" @click="visibleLarge = true" />
      <QDialog v-model:visible="visibleSmall" modal header="Small Dialog" size="small">
        <p class="dialog-content-text">Small (320px)</p>
      </QDialog>
      <QDialog v-model:visible="visibleMedium" modal header="Medium Dialog" size="medium">
        <p class="dialog-content-text">Medium (400px)</p>
      </QDialog>
      <QDialog v-model:visible="visibleLarge" modal header="Large Dialog" size="large">
        <p class="dialog-content-text">Large (720px)</p>
      </QDialog>
    </section>
    <div class="card mt-5 mb-5">
      <showCode :code="sizeCode" />
    </div>

    <!-- Passthrough Native Props -->
    <p class="mt-[20px] mb-[10px]">Passthrough Native Props (dismissableMask)</p>
    <section class="demo-section">
      <QButton color="primary" label="Show Dismissable" @click="visibleDismissable = true" />
      <QDialog v-model:visible="visibleDismissable" modal dismissableMask header="Dismissable Mask">
        <p class="dialog-content-text">This dialog can be closed by clicking the mask area (native PrimeVue prop).</p>
      </QDialog>
    </section>
    <div class="card mt-5 mb-5">
      <showCode :code="dismissableCode" />
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
import { ref, reactive } from 'vue';
import { QButton } from '@libs/p-comps/volt/QButton';
import QDialog from '@libs/p-comps/volt/Qdialog/index.vue';
import showCode from '../components/showCode.vue';
import { IconClose, IconFull, Icon2FullView, IconAdd, IconMini } from '@quantum/icons';

const [visibleBasic, visible, visibleSmall, visibleMedium, visibleLarge, visibleDismissable] =
  [ref(false), ref(false), ref(false), ref(false), ref(false), ref(false), ref(false)];
const visibleSlot = ref(false);
const collapsed = ref(false);
const formData = reactive({ username: '', email: '' });
const handleSave = () => { console.log('Saved:', formData); visible.value = false; };
const handleCustomHeaderHide = () => { collapsed.value = false; };

const importCode = `import QDialog from '@libs/p-comps/volt/Qdialog/index.vue';`;

const basicCode = `<QDialog v-model:visible="visible" modal header="Basic Dialog" size="medium">
  <p>Dialog content</p>
  <template #footer>
    <button @click="visible = false">Cancel</button>
    <button @click="visible = false">Confirm</button>
  </template>
</QDialog>`;

const customHeaderCode = `<QDialog v-model:visible="visible" modal collapsible @collapse="collapsed = true" @expand="collapsed = false">
  <template #header>
    <div class="qdialog-custom-header">
      <img src="avatar.png" class="avatar" />
      <span class="header-title">Amy Elsner</span>
    </div>
  </template>
  <p>Form content...</p>
  <template #footer>
    <button @click="visible = false">Cancel</button>
    <button @click="handleSave">Save</button>
  </template>
</QDialog>`;



const slotIconsCode = `<QDialog v-model:visible="visible" modal header="Header" :closable="false" :maximizable="false" :collapsible="false" size="large">
  <template #icons="{ isCollapsed, isMaximized, toggleCollapse, toggleMaximize, close }">
    <button class="qdialog-icon-btn" @click="toggleCollapse()">
      <IconMini v-if="!isCollapsed" />
      <IconAdd v-else />
    </button>
    <button class="qdialog-icon-btn" @click="toggleMaximize()">
      <Icon2FullView v-if="isMaximized" />
      <IconFull v-else />
    </button>
    <button class="qdialog-close-button" @click="close()">
      <IconClose class="qdialog-close-icon" />
    </button>
  </template>
  <p>Dialog content...</p>
</QDialog>`;

const sizeCode = `<QDialog size="small">...</QDialog>  <!-- 320px -->
<QDialog size="medium">...</QDialog> <!-- 400px -->
<QDialog size="large">...</QDialog>  <!-- 720px -->`;

const dismissableCode = `<QDialog v-model:visible="visible" modal dismissableMask header="Dismissable Mask">
  <p>Can close by clicking mask</p>
</QDialog>`;

const propsCode = `interface Props extends DialogProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'simple';
  closable?: boolean;
  header?: string;
  maximizable?: boolean;
  collapsible?: boolean;
  // + All PrimeVue Dialog props (modal, dismissableMask, etc.)
}`;

const slotsCode = `#header   - Custom header content
#icons    - Custom icon buttons
#default  - Dialog body content
#footer   - Footer with action buttons`;

const eventsCode = `hide, show, maximize, unmaximize, collapse, expand, 'update:visible'`;
</script>

<style scoped>
.card {
  width: 80%;
}

.demo-section {
  display: flex;
  justify-content: center;
  border: 1px dashed #D0BCFF;
  border-radius: 2rem;
  padding: 2rem;
  max-width: 64rem;
}
</style>
