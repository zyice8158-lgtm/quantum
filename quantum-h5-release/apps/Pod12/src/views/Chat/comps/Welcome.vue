<template>
    <div class="welcome-wrap">
<div class="welcome-wrap_icon">
<QIcons name="Logo" size="76"></QIcons>

</div>
<div class="welcome-wrap_btns">
    <QButton round :border="true">Pay attention</QButton>
    <QButton round :border="true">Remember This</QButton>
    <QButton round :border="true">Catch you up</QButton>
    <QButton round :border="true">Find files</QButton>
    <QButton round :border="true">Create Images</QButton>
</div>
    </div>
</template>

<script setup lang="ts">
import {QButton,QIcons} from '@libs/p-comps'
</script>

<style lang="less" scoped>
.welcome-wrap {
 height: 100%;
display: flex;
flex-direction: column;
justify-content: center;
>div{
    display: flex;
    justify-content: center;
padding: 0 27px;
}
    &_icon {
      margin-bottom: 26px;
    }
    
    &_btns {
      gap: 8px;
      flex-wrap: wrap;
      
    }
  ::v-deep(.q-button-round) {
padding: 0 20px;
  }
}
</style>