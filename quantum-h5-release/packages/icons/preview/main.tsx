import { createApp, defineComponent, ref } from 'vue'
import * as SingleColor from '../src/singleColor'
import * as multiColor from '../src/multiColor'
import './style.css'
const Toast = defineComponent({
  props: {
    message: String,
    show: Boolean
  },
  setup(props) {
    return () => {
      if (!props.show) return null;

      return (
        <div class="fixed top-[8px] right-[8px] bg-green-500 text-white px-[8px] py-[4px] rounded-md shadow-lg z-50 animate-fade-in">
          <div class="flex items-center">
            <svg class="w-[10px] h-[10px] mr-[4px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            {props.message}
          </div>
        </div>
      );
    }
  }
});

const App = defineComponent({
  setup() {
    const message = ref('Hello Quantum Icons!');
    const showToast = ref(false);
    const toastMessage = ref('');

    const copyIconName = (iconName: string) => {
      const componentTag = `<${iconName} />`;
      navigator.clipboard.writeText(componentTag).then(() => {
        // 显示自定义弹框提示
        toastMessage.value = `${componentTag} 已复制到剪贴板!`;
        showToast.value = true;

        // 3秒后自动隐藏提示
        setTimeout(() => {
          showToast.value = false;
        }, 3000);
      });
    };

    const singleColorIcons = Object.keys(SingleColor).map(key => ({
      name: key,
      component: SingleColor[key as keyof typeof SingleColor]
    }));

    const multiColorIcons = Object.keys(multiColor).map(key => ({
      name: key,
      component: multiColor[key as keyof typeof multiColor]
    }));

    const renderIconCollection = (icons: any[], title: string) => (
      <div class="w-full mb-[24px]">
        <h2 class="text-2xl font-bold mb-[12px] text-gray-800 border-b-[4px] border-blue-500 pb-[4px]">{title}</h2>
        <div class="flex flex-wrap gap-[12px]">
          {icons.map((icon) => (
            <div
              class="bg-white rounded-lg shadow-md p-[10px] flex flex-col items-center flex-shrink-0 cursor-pointer transition-shadow icon-card"
              onClick={() => copyIconName(icon.name)}
            >
              <h3 class="text-md font-medium mb-[6px]">{icon.name}</h3>
              <div class="text-3xl icon-component">
                <icon.component />
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    return () => (
      <div class="min-h-screen bg-gray-100 flex flex-col items-center p-[16px]">
        <h1 class="text-3xl font-bold mb-[16px] text-blue-600">{message.value}</h1>

        {/* Toast 提示组件 */}
        <Toast message={toastMessage.value} show={showToast.value} />

        {/* Single Color Icons Collection */}
        {renderIconCollection(singleColorIcons, 'Single Color Icons')}

        {/* Multi Color Icons Collection */}
        {renderIconCollection(multiColorIcons, 'Multi Color Icons')}
      </div>
    );
  }
});

createApp(App).mount('#app')

