
<template>
  <component :is="apps[SCOPE || 'Expedia']" />
</template>

<script setup lang="ts">
import {Expedia} from './apps'

const SCOPE:string = import.meta.env.VITE_CURRENT_SCOPE
const apps: Record<string, unknown> = { Expedia }
</script>
