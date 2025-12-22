import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "SuggestionView",
  props: {
    item: {
      type: Object,
    },
    showName: {
      type: String,
      default: "name",
    },
  },
  setup(props) {
    return () => (
      <div class="relative inline-block rounded-[32px] px-[16px] py-[8px] cursor-pointer z-0 whitespace-nowrap text-shadow-lg/20 bg-[#00000050]" style={{
        // background: "linear-gradient(22deg, rgba(0, 0, 0, 0.00) -194.17%, rgba(0, 0, 0, 0.15) -144.42%, rgba(0, 0, 0, 0.15) -34.6%, rgba(0, 0, 0, 0.07) 15.59%, rgba(0, 0, 0, 0.15) 65.97%, rgba(0, 0, 0, 0.15) 208.83%, rgba(0, 0, 0, 0.00) 231.6%)",
        boxShadow: "0 0 10px 1px rgba(0, 0, 0, 0.15)",
        backdropFilter: "blur(25px)",
      }}>
        {/* 渐变边框伪元素 */}
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "32px",
            padding: "2px",
            background: "linear-gradient(89deg, rgba(103, 143, 255, 0.00) -31.98%, #678FFF -1.77%, #FA77DE 20.33%, #FFA680 45.89%, #FA77DE 72.63%, #678FFF 94.73%, rgba(103, 143, 255, 0.00) 121.25%)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            pointerEvents: "none",
            zIndex: -1,
            boxSizing: "border-box",
            display: "block",
          }}
        />
        <span
          class="relative z-1 font-[500] text-[12px] leading-[16px] text-white">
          {props.item[props.showName]}
        </span>
      </div>
    );
  },
});

