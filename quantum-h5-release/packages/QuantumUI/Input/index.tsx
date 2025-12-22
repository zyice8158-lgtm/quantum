import { defineComponent, watch, ref, onMounted, withModifiers } from 'vue';
import Base from '../Base';
import './index.less';
import { createNamespace } from '../utils/create';
const [name, bem] = createNamespace('input');
const Input = defineComponent({
  name,
  extends: [Base],
  props: {
    tag: { type: String, required: true, default: 'input' },
    placeholder: { type: String, default: 'Ask Any Question' },
    modelValue: { type: String, default: '' },
    otherProps: { type: Object, default: {} },
    minRows: { type: Number, default: 1 },
    maxRows: { type: Number, default: 3 },
    disabled: { type: Boolean, default: false },
  },

  emits: ['change', 'clear', 'focus', 'blur', 'pressEnter', 'update:modelValue', 'backEnter'],
  setup(props, { slots, emit }) {
    const { tag, modelValue, otherProps } = props;
    const inputRef = ref<HTMLInputElement | null>(null);
    const classes = bem([

    ]);
    const onChangeInput = ($event: { target: { value: string, scrollHeight: number } }) => {
      emit('update:modelValue', $event.target.value);
      const textarea = document.querySelector('.q-input_content textarea') as HTMLTextAreaElement;
      textarea.style.height = $event.target.scrollHeight + 'px';
    }
    const handleKeyDown = (e?: KeyboardEvent) => {
      const ENTER_CODE = 13;
      const BACK_CODE = 8;
      if (e.keyCode === ENTER_CODE) {
        e.preventDefault();
        emit('pressEnter', modelValue);
      }
      // 没有内容回退
      if (e.keyCode === BACK_CODE && e.target.value === '') {
        e.preventDefault();
        emit('backEnter');
      }
    }
    const updateValue = (value: string) => {
      const inputValue = inputRef.value?.value;
      if (inputValue !== value) {
        inputRef.value.value = value;
      }
    }
    watch(() => props.modelValue, () => {
      updateValue(props.modelValue);
    });
    watch([inputRef], () => {
      console.log('textAreaRef111---------', inputRef.value);
    });
    const renderLeft = () => {
      if (slots.left) {
        return slots.left();
      }
      return '';
    }
    const renderRight = () => {
      if (slots.right) {
        return slots.right();
      }
      return '';
    }

    const renderTop = () => {
      if (slots.top) {
        return slots.top();
      }
      return '';
    }

    return () => {
      return (
        <div class={classes}>
          {renderTop()}
          <div class={bem('content')}>
            {renderLeft()}
            <tag {...otherProps} disabled={props.disabled} ref={inputRef} placeholder={props.placeholder} onMousedown={withModifiers(() => null, ['stop'])} onInput={onChangeInput} onKeydown={handleKeyDown} />
            {renderRight()}
          </div>
        </div>
      )
    }
  }
});
export default Input;

