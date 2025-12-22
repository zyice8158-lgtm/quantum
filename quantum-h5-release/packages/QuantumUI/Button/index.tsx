import { defineComponent, withModifiers } from 'vue';
import { SvgIcon } from '../Icons';
import Base from '../Base';
import { createNamespace } from '../utils/create';
import './index.less';
const [name, bem] = createNamespace('button');
const Button = defineComponent({
  name,
  extends: [Base],
  props: {
    tag: { type: String, required: true, default: 'button' },
    icon: { type: String, required: false, },
    iconSize: { type: String, default: '24', },
    loading: { type: Boolean, default: false },
    type: { type: String, default: 'default' },
    round: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    border: { type: Boolean, default: false },
    text: { type: String, default: '' },
  },
  emits: ['click'],
  setup(props, { slots, emit }) {
    return () => {
      const { icon, iconSize, loading, type, round, disabled, border, tag } = props;
      const classes = bem([
        type,
        {
          round,
          disabled, border
        }
      ]);
      const renderIcon = () => {
        if (slots.icon) {
          return slots.icon();
        }
        if (icon) {
          return (
            <SvgIcon name={icon} size={iconSize} />
          )
        }
      }
      const renderText = () => {
        const text = slots.default ? slots.default() : props.text;
        if (text) {
          return <span class={bem('text')}>{text}</span>
        }
      }
      const handleBtnClick = () => {
        if(!disabled) {
          emit('click');
        }
      }
      return (
        <tag class={classes} onClick={handleBtnClick}>
          <div class={bem('content')}>
            {renderIcon()}
            {renderText()}
          </div>
        </tag>
      )
    }
  }
});
Button.install = (app: any) => {
  app.component(Button.name, Button);
};
export default Button;


type WithModifiersParams = Parameters<typeof withModifiers>
export const stopModifiers = (fn: WithModifiersParams[0] = (() => 0), modifiers: WithModifiersParams[1] = ['stop']) => withModifiers(fn, modifiers as any)



export const ButtonIcon = defineComponent({
  name: "ButtonIcon",
  setup(_, { slots }) {
    return () => (
      <div
        class="w-[48px] h-[48px] ml-[13px] text-[16px] flex items-center justify-center cursor-pointer hover:bg-gray-200 rounded-full"
        onMousedown={stopModifiers()}
      >
        {slots.default()}
      </div>
    );
  },
});