import { defineComponent, watch, ref, computed } from 'vue';
import Base from '../Base';
import './index.less';
import { createNamespace } from '../utils/create';
const [name , bem] = createNamespace('select');
import { SelectProps, OptionItem } from './type';

const defaultOptions: OptionItem[] = [];

const Select = defineComponent({
  name,
  extends: [Base],
  props: {
    tag: { type: String, required: true, default: 'input' },
    modelValue: { type: String, default: '' },
    options: { type: Array, default: undefined },
    otherProps: { type: Object, default: {} },
  },
  emits: ['select', 'update:modelValue'],
  setup(props: SelectProps, { emit }) {
    const activeOptIndex = ref<string>('1');
    const isVisible = ref<boolean>(true);
    const classes = bem([]);
    // 优先用props.options，否则用默认
    const options = computed(() => props.options && props.options.length > 0 
    ? props.options 
    : defaultOptions
    );
   
    const updateValue = (value: string) => {
      activeOptIndex.value = value;
    };
    // 处理点击事件，优先用item.onClick，否则emit
    const handleClick = (item: OptionItem) => {
      if (item.onClick) {
        item.onClick();
      }
      emit('select', item);
      emit('update:modelValue', item.value);
      activeOptIndex.value = item.value;
    };
    return () => (
      <div class={classes}>
        <div class={bem('dropdown')} style={{ display: isVisible.value ? 'block' : 'none' }}>
          {options.value.map((item: OptionItem) => (
            <div onClick={() => handleClick(item)} class={bem('item', [{ active: item.value === activeOptIndex.value }])}>
              {item.iconPath && <img src={item.iconPath} class={bem('item-icon')} />}
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
});
export default Select;

