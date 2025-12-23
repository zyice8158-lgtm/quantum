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
    <section class="space-y-4">
      <div class="border border-dashed border-[#D0BCFF] rounded-[2rem] p-8 max-w-5xl flex justify-center">
        <QButton color="primary" label="Show Basic" @click="visibleBasic = true" />

        <QDialog v-model:visible="visibleBasic" modal header="Basic Dialog" size="medium">
          <p class="dialog-content-text">
            This is a basic dialog with default settings.
          </p>
          <template #footer>
            <button class="qdialog-btn qdialog-btn-cancel" @click="visibleBasic = false">Cancel</button>
            <button class="qdialog-btn qdialog-btn-save" @click="visibleBasic = false">Confirm</button>
          </template>
        </QDialog>
      </div>
    </section>
    <div class="mt-[20px] mb-[20px]">
      <showCode class="card" :code="basicCode" />
    </div>

    <!-- Custom Header Dialog -->
    <p class="mt-[20px] mb-[10px]">Custom Header with Avatar</p>
    <section class="space-y-4">
      <div class="border border-dashed border-[#D0BCFF] rounded-[2rem] p-8 max-w-5xl flex justify-center">
        <QButton color="primary" label="Show Custom Header" @click="visible = true" />

        <QDialog v-model:visible="visible" modal>
          <template #header>
            <div class="qdialog-custom-header">
              <img
                src="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
                alt="Amy Elsner"
                class="avatar"
              />
              <span class="header-title">Amy Elsner</span>
            </div>
          </template>

          <template #icons>
            <button class="qdialog-icon-btn" @click="collapsed = !collapsed">
              <IconAdd v-if="collapsed" />
              <IconMini v-else />
            </button>
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
      </div>
    </section>
    <div class="mt-[20px] mb-[20px]">
      <showCode class="card" :code="customHeaderCode" />
    </div>

    <!-- Maximizable & Collapsible Dialog -->
    <p class="mt-[20px] mb-[10px]">Maximizable & Collapsible</p>
    <section class="space-y-4">
      <div class="border border-dashed border-[#D0BCFF] rounded-[2rem] p-8 max-w-5xl flex justify-center">
        <QButton color="primary" label="Show Maximizable" @click="visibleMax = true" />

        <QDialog
          v-model:visible="visibleMax"
          modal
          header="Header"
          maximizable
          collapsible
          size="large"
        >
          <p class="dialog-content-text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
            et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
            et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
            et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
        </QDialog>
      </div>
    </section>
    <div class="mt-[20px] mb-[20px]">
      <showCode class="card" :code="maximizableCode" />
    </div>

    <!-- Size Variants -->
    <p class="mt-[20px] mb-[10px]">Size Variants</p>
    <section class="space-y-4">
      <div class="border border-dashed border-[#D0BCFF] rounded-[2rem] p-8 max-w-5xl flex justify-center gap-4">
        <QButton color="primary" label="Small" @click="visibleSmall = true" />
        <QButton color="primary" label="Medium" @click="visibleMedium = true" />
        <QButton color="primary" label="Large" @click="visibleLarge = true" />

        <QDialog v-model:visible="visibleSmall" modal header="Small Dialog" size="small">
          <p class="dialog-content-text">Small size dialog (320px)</p>
        </QDialog>

        <QDialog v-model:visible="visibleMedium" modal header="Medium Dialog" size="medium">
          <p class="dialog-content-text">Medium size dialog (400px)</p>
        </QDialog>

        <QDialog v-model:visible="visibleLarge" modal header="Large Dialog" size="large">
          <p class="dialog-content-text">Large size dialog (720px)</p>
        </QDialog>
      </div>
    </section>
    <div class="mt-[20px] mb-[20px]">
      <showCode class="card" :code="sizeCode" />
    </div>

    <!-- Props -->
    <p class="mt-[20px] mb-[10px]">Props</p>
    <div class="card">
      <showCode :code="propsCode" lang="typescript" />
    </div>

    <!-- Slots -->
    <p class="mt-[20px] mb-[10px]">Slots</p>
    <div class="card">
      <showCode :code="slotsCode" />
    </div>

    <!-- Events -->
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
import { IconMini, IconAdd } from '@quantum/icons';

const visibleBasic = ref(false);
const visible = ref(false);
const collapsed = ref(false);
const visibleMax = ref(false);
const visibleSmall = ref(false);
const visibleMedium = ref(false);
const visibleLarge = ref(false);

const formData = reactive({
  username: '',
  email: ''
});

const handleSave = () => {
  console.log('Saved:', formData);
  visible.value = false;
};

const importCode = `import QDialog from '@libs/p-comps/volt/Qdialog/index.vue';`;

const basicCode = `<QDialog v-model:visible="visible" modal header="Basic Dialog" size="medium">
  <p>This is a basic dialog with default settings.</p>
  <template #footer>
    <button @click="visible = false">Cancel</button>
    <button @click="visible = false">Confirm</button>
  </template>
</QDialog>`;

const customHeaderCode = `<QDialog v-model:visible="visible" modal>
  <template #header>
    <div class="qdialog-custom-header">
      <img src="avatar.png" class="avatar" />
      <span class="header-title">Amy Elsner</span>
    </div>
  </template>

  <template #icons>
    <button class="qdialog-icon-btn" @click="collapsed = !collapsed">
      <IconAdd v-if="collapsed" />
      <IconMini v-else />
    </button>
  </template>

  <p>Update your information.</p>
  <!-- Form content -->

  <template #footer>
    <button @click="visible = false">Cancel</button>
    <button @click="handleSave">Save</button>
  </template>
</QDialog>`;

const maximizableCode = `<QDialog
  v-model:visible="visible"
  modal
  header="Header"
  maximizable
  collapsible
  size="large"
>
  <p>Dialog content...</p>
</QDialog>`;

const sizeCode = `<!-- Small: 320px -->
<QDialog header="Small" size="small">...</QDialog>

<!-- Medium: 400px (default) -->
<QDialog header="Medium" size="medium">...</QDialog>

<!-- Large: 720px -->
<QDialog header="Large" size="large">...</QDialog>`;

const propsCode = `interface Props {
  size?: 'small' | 'medium' | 'large';  // Dialog width
  variant?: 'default' | 'simple';        // Border style
  closable?: boolean;                    // Show close button (default: true)
  header?: string;                       // Header title text
  maximizable?: boolean;                 // Show maximize button
  collapsible?: boolean;                 // Show collapse button
  modal?: boolean;                       // Show modal overlay
}`;

const slotsCode = `<!-- #header - Custom header content -->
<template #header>
  <div class="custom-header">...</div>
</template>

<!-- #icons - Custom icon buttons (before maximize/close) -->
<template #icons>
  <button>Custom Icon</button>
</template>

<!-- #default - Dialog body content -->
<p>Main content goes here</p>

<!-- #footer - Footer with action buttons -->
<template #footer>
  <button>Cancel</button>
  <button>Confirm</button>
</template>`;

const eventsCode = `const emit = defineEmits<{
  hide: [];                              // Fired when dialog is hidden
  show: [];                              // Fired when dialog is shown
  maximize: [];                          // Fired when maximized
  unmaximize: [];                        // Fired when restored from maximize
  collapse: [];                          // Fired when collapsed
  expand: [];                            // Fired when expanded
  'update:visible': [value: boolean];    // v-model binding
}>();`;
</script>

<style scoped>
.card {
  width: 80%;
}
</style>
