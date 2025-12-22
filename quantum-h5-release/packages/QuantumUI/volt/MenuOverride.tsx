import Menu from "primevue/menu";
import absolutePosition from "../utils/dom/absolutePosition";
import getOuterWidth from "../utils/dom/getOuterWidth";

export default () => {
  Menu.methods.alignOverlay = function () {
    absolutePosition(this.container, this.target);
    const targetWidth = getOuterWidth(this.target);

    if (targetWidth > getOuterWidth(this.container)) {
      this.container.style.minWidth = getOuterWidth(this.target) + "px";
    }
  };
};
