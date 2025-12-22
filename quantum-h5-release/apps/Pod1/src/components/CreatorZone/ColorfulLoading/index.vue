<template>
  <div class="colorful-loading">
    <img src="@/assets/img/svg/imageLoading.svg" />
  </div>
</template>

<script setup></script>

<style lang="less" scoped>
.colorful-loading {
  background: linear-gradient(
    45deg,
    #5c8dff,
    #a079ff,
    #d06ad6,
    #eb6296,
    #ff7257,
    #eb6296,
    #d06ad6,
    #a079ff,
    #5c8dff,
    #a079ff,
    #d06ad6,
    #eb6296,
    #ff7257
  );
  background-size: 800% 100%;
  border-radius: 16px;
  animation: image-loading 2.6s linear infinite;
  display: flex;
  justify-content: center;
  align-items: center;

  > img {
    width: 144px;
  }

  @keyframes image-loading {
    0% {
      background-position: 86% 0;
    }

    100% {
      background-position: 0 0;
    }
  }
}
</style>
