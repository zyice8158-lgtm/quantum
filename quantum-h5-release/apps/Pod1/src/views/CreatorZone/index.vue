<template>
  <div id="container" class="select-none">
    <RouterView v-slot="{ Component }">
      <template v-if="Component">
        <component :is="Component"></component>
      </template>
    </RouterView>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped>
#container {
  width: 100%;
  height: 100%;

  &::after {
    content: url("@/assets/img/editor/upload-image/pictures_00000.png")
      url("@/assets/img/editor/upload-image/pictures_00001.png")
      url("@/assets/img/editor/upload-image/pictures_00002.png")
      url("@/assets/img/editor/upload-image/pictures_00003.png")
      url("@/assets/img/editor/upload-image/pictures_00004.png")
      url("@/assets/img/editor/upload-image/pictures_00005.png")
      url("@/assets/img/editor/upload-image/pictures_00006.png")
      url("@/assets/img/editor/upload-image/pictures_00007.png")
      url("@/assets/img/editor/upload-image/pictures_00008.png")
      url("@/assets/img/editor/upload-image/pictures_00009.png")
      url("@/assets/img/editor/upload-image/pictures_00010.png")
      url("@/assets/img/editor/upload-image/pictures_00011.png")
      url("@/assets/img/editor/upload-image/pictures_00012.png")
      url("@/assets/img/editor/upload-image/pictures_00013.png")
      url("@/assets/img/editor/upload-image/pictures_00014.png")
      url("@/assets/img/editor/upload-image/pictures_00015.png")
      url("@/assets/img/editor/upload-image/pictures_00016.png")
      url("@/assets/img/editor/upload-image/pictures_00017.png")
      url("@/assets/img/editor/upload-image/pictures_00018.png")
      url("@/assets/img/editor/upload-image/pictures_00019.png")
      url("@/assets/img/editor/upload-image/pictures_00020.png")
      url("@/assets/img/editor/upload-image/pictures_00021.png")
      url("@/assets/img/editor/upload-image/pictures_00022.png")
      url("@/assets/img/editor/upload-image/pictures_00023.png")
      url("@/assets/img/editor/upload-image/pictures_00024.png")
      url("@/assets/img/editor/upload-image/pictures_00025.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00000.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00001.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00002.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00003.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00004.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00005.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00006.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00007.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00008.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00009.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00010.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00011.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00012.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00013.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00014.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00015.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00016.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00017.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00018.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00019.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00020.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00021.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00022.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00023.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00024.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00025.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00026.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00027.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00028.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00029.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00030.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00031.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00032.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00033.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00034.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00035.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00036.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00037.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00038.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00039.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00040.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00041.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00042.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00043.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00044.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00045.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00046.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00047.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00048.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00049.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00050.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00051.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00052.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00053.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00054.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00055.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00056.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00057.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00058.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00059.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00060.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00061.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00062.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00063.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00064.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00065.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00066.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00067.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00068.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00069.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00070.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00071.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00072.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00073.png")
      url("@/assets/img/avatar/Style redrawing/Style redrawing_00074.png");
    width: 0;
    height: 0;
    overflow: hidden;
    opacity: 0;
    position: fixed;
    z-index: -1000;
  }
}
</style>
