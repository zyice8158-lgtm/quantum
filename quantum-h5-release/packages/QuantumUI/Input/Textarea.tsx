import { defineComponent, watch, ref, withModifiers } from 'vue';
import Base from '../Base';
import './index.less';
import { createNamespace } from '../utils/create';
import { apiWinDrag, apiWinInfo } from '@libs/service';
const [name, bem] = createNamespace('input');
const QTextarea = defineComponent({
  name,
  extends: [Base],
  props: {
    tag: { type: String, required: true, default: 'textarea' },
    placeholder: { type: String, default: 'Ask Any Question' },
    modelValue: { type: String, default: '' },
    otherProps: { type: Object, default: {} },
    minRows: { type: Number, default: 1 },
    maxRows: { type: Number, default: 3 },
    disabled: { type: Boolean, default: false },
  },

  emits: ['change', 'clear', 'focus', 'blur', 'pressEnter', 'update:modelValue', 'backEnter'],
  setup(props, { slots, emit }) {
    const { tag, modelValue, otherProps, minRows, maxRows } = props;
    const inputRef = ref<HTMLInputElement | null>(null); // dom节点
    const classes = bem([

    ]);

    const onChangeInput = ($event: { target: { value: string, scrollHeight: number } }) => {
      emit('update:modelValue', $event.target.value);
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
      //   if (e.key === 'Enter' && e.shiftKey) {
      //     // Shift+Enter换行
      //     e.preventDefault();
      //     const start = inputRef.value.selectionStart;
      //     const end = inputRef.value.selectionEnd;
      //     const value = inputRef.value.value;
      //     inputRef.value.value = value.substring(0, start) + '\n' + value.substring(end);
      //     inputRef.value.selectionStart = inputRef.value.selectionEnd = start + 1;
      //     resizeTextarea();
      //   }

    }
    const updateValue = (value: string) => {
      const inputValue = inputRef.value?.value;
      if (inputValue !== value) {
        inputRef.value.value = value;
      }
    }
    const renderLeft = () => {
      watch(() => props.modelValue, () => {
        updateValue(props.modelValue);
      });
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


    const handleInputClick = async () => {
      // TODO temp solution to fix the issue of window input
      const res = await apiWinInfo();
      const { id } = JSON.parse(res.data.Data);
      // console.log('handleInputFocus', );

      apiWinDrag({ id });
    };


    return () => {
      return (
        <div class={classes} style={{ '--textarea-min-rows': minRows, '--textarea-max-rows': maxRows } as any} >
          {renderTop()}
          <div class={bem('content')} v-automation="input_box">
            {renderLeft()}
            <tag {...otherProps} disabled={props.disabled} ref={inputRef} placeholder={props.placeholder} onMousedown={withModifiers(() => null, ['stop'])} onClick={handleInputClick} onInput={onChangeInput} onKeydown={handleKeyDown} />
            {renderRight()}
          </div>
        </div>
      )
    }
  }
});
export default QTextarea;

