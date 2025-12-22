<template>
  <div class="page-container">
    <h1 class="text-2xl font-bold mb-6">Tooltip</h1>

    <!-- Basic Import -->
    <p class="mt-[20px] mb-[10px]">Basic Import</p>
    <div class="card">
      <showCode :code="importCode" />
    </div>

    <!-- Basic Usage -->
    <p class="mt-[20px] mb-[10px]">Position</p>
    <section class="space-y-4">
      <div class="border border-dashed border-[#D0BCFF] rounded-[2rem] p-8 max-w-5xl">
        <div class="basic-tooltip-section flex flex-col gap-4 items-center">
          <Button v-tooltip.top="{
            value: 'Tooltip on top',
            pt: {
              root: { class: 'custom-arrow-tooltip' },
              arrow: { class: 'arrow-center' }
            }
          }">
            top
          </Button>
          <Button v-tooltip.bottom="{
            value: 'Tooltip on bottom',
            showDelay: 100,
            hideDelay: 300,
            pt: {
              root: { class: 'custom-arrow-tooltip' },
              arrow: { class: 'arrow-center' }
            }
          }">
            bottom
          </Button>
          <Button v-tooltip.left="{
            value: 'Tooltip on left',
            showDelay: 100,
            hideDelay: 300,
            pt: {
              root: { class: 'custom-arrow-tooltip' },
              arrow: { class: 'arrow-center' }
            }
          }">
            left
          </Button>
          <Button v-tooltip.right="{
            value: 'Tooltip on right',
            showDelay: 100,
            hideDelay: 300,
            pt: {
              root: { class: 'custom-arrow-tooltip' },
              arrow: { class: 'arrow-center' }
            }
          }">
            right
          </Button>
        </div>
      </div>
    </section>

    <div class="mt-[20px] mb-[20px]">
      <showCode class="card" :code="positionCode" />
    </div>

    <!-- Custom Style -->
    <p class="mt-[20px] mb-[10px]">Custom Style</p>
    <section class="space-y-4">
      <div class="border border-dashed border-[#D0BCFF] rounded-[2rem] p-8 max-w-5xl">
        <div class="flex justify-center">
          <Button v-tooltip.bottom="{
            value: 'Custom red background',
            showDelay: 100,
            hideDelay: 3000,
            pt: {
              root: { class: 'custom-arrow-tooltip' },
              arrow: { class: 'arrow-center' },
              text: 'bg-[red]! text-[#fff]!'
            }
          }">
            Custom Style
          </Button>
        </div>
      </div>
    </section>

    <div class="mt-[20px] mb-[20px]">
      <showCode class="card" :code="customStyleCode" />
    </div>

    <!-- Arrow Alignment -->
    <p class="mt-[20px] mb-[10px]">Arrow Alignment</p>
    <section class="space-y-4">
      <div class="border border-dashed border-[#D0BCFF] rounded-[2rem] p-8 max-w-5xl">
        <div class="flex flex-wrap justify-center gap-4 items-center">
          <Button v-tooltip.top="{
            value: 'Long text with arrow on left side for alignment demo',
            pt: {
              root: {
                class: 'custom-arrow-tooltip',
                style: 'transform: translateX(calc(50% - 20px))'
              },
              arrow: { class: 'arrow-left' }
            }
          }">
             Left
          </Button>
          <Button v-tooltip.top="{
            value: 'Long text with centered arrow for alignment demo',
            pt: {
              root: { class: 'custom-arrow-tooltip' },
              arrow: { class: 'arrow-center' }
            }
          }">
             Center
          </Button>
          <Button v-tooltip.top="{
            value: 'Long text with arrow on right side for alignment demo',
            pt: {
              root: {
                class: 'custom-arrow-tooltip',
                style: 'transform: translateX(calc(-50% + 20px))'
              },
              arrow: { class: 'arrow-right' }
            }
          }">
             Right
          </Button>
        </div>
      </div>
    </section>

    <div class="mt-[20px] mb-[20px]">
      <showCode class="card" :code="arrowAlignmentCode" />
    </div>

    <!-- Props -->
    <p class="mt-[20px] mb-[10px]">Props</p>
    <div class="card">
      <showCode :code="propsCode" lang="typescript" />
    </div>
  </div>
</template>

<script setup lang="ts">
import showCode from '../components/showCode.vue';

const importCode = `// 使用 PrimeVue v-tooltip 指令
// 已全局注册，无需单独导入`;

const positionCode = `<!-- Top -->
<Button v-tooltip.top="{
  value: 'Tooltip on top',
  pt: {
    root: { class: 'custom-arrow-tooltip' },  //加入 show-arrow 弹窗有箭头
    arrow: { class: 'arrow-center' }
  }
}">top</Button>

<!-- Bottom -->
<Button v-tooltip.bottom="{
  value: 'Tooltip on bottom',
  showDelay: 100,
  hideDelay: 300,
  pt: {
    root: { class: 'custom-arrow-tooltip' },
    arrow: { class: 'arrow-center' }
  }
}">bottom</Button>

<!-- Left -->
<Button v-tooltip.left="{
  value: 'Tooltip on left',
  pt: {
    root: { class: 'custom-arrow-tooltip' },
    arrow: { class: 'arrow-center' }
  }
}">left</Button>

<!-- Right -->
<Button v-tooltip.right="{
  value: 'Tooltip on right',
  pt: {
    root: { class: 'custom-arrow-tooltip' },
    arrow: { class: 'arrow-center' }
  }
}">right</Button>`;

const customStyleCode = `<!-- 自定义样式：通过 pt.text 传入 Tailwind 类名 -->
<Button v-tooltip.bottom="{
  value: 'Custom red background',
  showDelay: 100,
  hideDelay: 3000,
  pt: {
    root: { class: 'custom-arrow-tooltip' },
    arrow: { class: 'arrow-center' },
    text: 'bg-[red]! text-[#fff]!'
  }
}">Custom Style</Button>`;

const arrowAlignmentCode = `<!-- 箭头左对齐 -->
<Button v-tooltip.top="{
  value: 'Long text...',
  pt: {
    root: {
      class: 'custom-arrow-tooltip',
      style: 'transform: translateX(calc(50% - 20px))'
    },
    arrow: { class: 'arrow-left' }
  }
}">Arrow Left</Button>

<!-- 箭头居中 -->
<Button v-tooltip.top="{
  value: 'Long text...',
  pt: {
    root: { class: 'custom-arrow-tooltip' },
    arrow: { class: 'arrow-center' }
  }
}">Arrow Center</Button>

<!-- 箭头右对齐 -->
<Button v-tooltip.top="{
  value: 'Long text...',
  pt: {
    root: {
      class: 'custom-arrow-tooltip',
      style: 'transform: translateX(calc(-50% + 20px))'
    },
    arrow: { class: 'arrow-right' }
  }
}">Arrow Right</Button>`;

const propsCode = `interface TooltipOptions {
  value: string;                    // 提示文本
  showDelay?: number;               // 显示延迟 (ms)
  hideDelay?: number;               // 隐藏延迟 (ms)
  pt?: {
    root?: { class?: string; style?: string };  // 根元素样式
    arrow?: { class?: string };                  // 箭头样式 (arrow-left | arrow-center | arrow-right)
    text?: string;                               // 文本样式 (Tailwind 类名)
  }
}

// 位置修饰符: .top | .bottom | .left | .right`;
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.card {
  width: 80%;
}
</style>
