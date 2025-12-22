<template>
    <div class="page-container">
        <!-- Theme Toggle Button -->
        <button @click="toggleTheme" class="theme-toggle-btn" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            <i class="pi" :class="isDark ? 'pi-moon' : 'pi-sun'" />
        </button>

        <h1 class="text-2xl font-bold mb-6">Alert Banner</h1>

        <!-- Basic Import -->
        <p class="mt-[20px] mb-[10px]">Basic</p>
        <div class="card">
            <showCode :code="importCode" />
        </div>

        <!-- Severity Types -->
        <p class="mt-[20px] mb-[10px]">Severity Types</p>
        <section class="space-y-4">
            <div class="border border-dashed border-[#D0BCFF] rounded-[2rem] p-8 max-w-5xl">
                <Qmessage severity="contrast" :closable="true">
                    <span class="font-semibold">Alert Title</span>
                    <span class="opacity-90 ml-1">Alert banner message text</span>
                    <template #action>
                        <button class="action-btn action-btn-contrast" @click="addGraphicBanner">Action</button>
                    </template>
                </Qmessage>

                <Qmessage severity="secondary" :closable="true">
                    <span class="font-semibold">Alert Title</span>
                    <span class="opacity-70 ml-1">Alert banner message text</span>
                    <template #action>
                        <button class="action-btn action-btn-secondary" @click="addGraphicBanner">Action</button>
                    </template>
                </Qmessage>

                <Qmessage severity="info" :closable="true">
                    <span class="font-semibold">Alert Title</span>
                    <span class="opacity-80 ml-1">Alert banner message text</span>
                    <template #action>
                        <button class="action-btn action-btn-info" @click="addGraphicBanner">Action</button>
                    </template>
                </Qmessage>

                <Qmessage severity="success" :closable="true">
                    <span class="font-semibold">Success!</span>
                    <span class="opacity-80 ml-1">Alert banner message text</span>
                    <template #action>
                        <button class="action-btn action-btn-success" @click="addGraphicBanner">Action</button>
                    </template>
                </Qmessage>

                <Qmessage severity="warn" :closable="true">
                    <span class="font-semibold">Warning:</span>
                    <span class="opacity-80 ml-1">Alert banner message text</span>
                    <template #action>
                        <button class="action-btn action-btn-warn" @click="addGraphicBanner">Action</button>
                    </template>
                </Qmessage>

                <Qmessage severity="error" :closable="true">
                    <span class="font-semibold">Error:</span>
                    <span class="opacity-80 ml-1">Alert banner message text</span>
                    <template #action>
                        <button class="action-btn action-btn-error" @click="addGraphicBanner">Action</button>
                    </template>
                </Qmessage>
            </div>
        </section>

        <div class="mt-[20px] mb-[20px]">
            <showCode class="card" :code="severityCode" />
        </div>

        <!-- Graphic Banner -->
        <section v-if="graphicBanners.length > 0" class="space-y-4 mt-8">
            <h2 class="text-2xl font-bold">Graphic Banner</h2>
            <div class="border border-dashed border-[#D0BCFF] rounded-[2rem] p-8 max-w-5xl">
                <Qmessage v-for="(banner, index) in graphicBanners" :key="banner.id" variant="graphic" :closable="true" @close="removeGraphicBanner(index)">
                    <template #icon>
                        <div class="graphic-icon">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 32L20 8L32 32" stroke="#FF6B6B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M12 28L24 12L32 28" stroke="#4ECDC4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M16 24L28 16" stroke="#6C5CE7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                    </template>
                    <div class="graphic-content">
                        <div class="graphic-title">Alert Title</div>
                        <div class="graphic-text">Alert banner message text</div>
                        <div class="graphic-progress">
                            <div class="graphic-progress-bar" :style="{ width: banner.progress + '%' }"></div>
                        </div>
                    </div>
                </Qmessage>
            </div>
            <div class="mt-[20px] mb-[20px]">
                <showCode class="card" :code="graphicCode" />
            </div>
        </section>

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
    </div>
</template>

<script setup lang="ts">
import Qmessage from '../../../../../packages/QuantumUI/volt/Qmessage/index.vue';
import showCode from '../components/showCode.vue';
import { ref, onMounted } from 'vue';
import './index.less';

interface GraphicBanner { id: number; progress: number; }

const graphicBanners = ref<GraphicBanner[]>([]);
let bannerId = 0;
const isDark = ref(false);

const toggleTheme = () => {
    isDark.value = !isDark.value;
    document.documentElement.classList.toggle('theme-dark', isDark.value);
};

onMounted(() => {
    document.documentElement.classList.remove('theme-dark');
    isDark.value = false;
});

const addGraphicBanner = () => {
    graphicBanners.value.push({ id: bannerId++, progress: Math.floor(Math.random() * 60) + 20 });
};

const removeGraphicBanner = (index: number) => {
    graphicBanners.value.splice(index, 1);
};

const importCode = `import Qmessage from '@packages/QuantumUI/volt/Qmessage/index.vue';`;

const severityCode = `<!-- 组件内置默认图标，无需手动引入 -->
<Qmessage severity="contrast" :closable="true">
    <span class="font-semibold">Alert Title</span>
    <span>Alert banner message text</span>
    <template #action><button @click="handleAction">Action</button></template>
</Qmessage>

<!-- 可选 severity: contrast | secondary | info | success | warn | error -->
<Qmessage severity="info" :closable="true">...</Qmessage>
<Qmessage severity="success" :closable="true">...</Qmessage>
<Qmessage severity="warn" :closable="true">...</Qmessage>
<Qmessage severity="error" :closable="true">...</Qmessage>`;

const graphicCode = `<Qmessage variant="graphic" :closable="true" @close="handleClose">
    <template #icon><svg>...</svg></template>
    <div class="graphic-content">
        <div class="graphic-title">Alert Title</div>
        <div class="graphic-text">Alert banner message text</div>
        <div class="graphic-progress">
            <div class="graphic-progress-bar" :style="{ width: progress + '%' }"></div>
        </div>
    </div>
</Qmessage>`;

const propsCode = `interface Props {
    severity?: 'contrast' | 'secondary' | 'info' | 'success' | 'warn' | 'error';
    variant?: 'filled' | 'outlined' | 'graphic';
    closable?: boolean;
}`;

const slotsCode = `<!-- #icon - 左侧图标插槽（可选，组件内置默认图标） -->
<template #icon><CustomIcon /></template>

<!-- #default - 默认内容插槽 -->
<span class="font-semibold">Title</span>
<span>Message text</span>

<!-- #action - 右侧操作按钮插槽 -->
<template #action><button @click="handleAction">Action</button></template>`;
</script>

<style scoped>
.card { width: 80%; }
</style>
