<script setup lang="ts">
import { RouterView,RouterLink,useRouter } from "vue-router";
import { ref } from "vue";
const router = useRouter();
// console.log(router.getRoutes(),5);
const routerListAll = router.getRoutes();
//  ref([
//   { name: "Button", path: "/button/index" },
//   { name: "Lists", path: "/lists/index" },
//   { name: "ToolTip", path: "/toolTip/index" },
//   { name: "Dropdown", path: "/dropdown/index" },
//   { name: "Menu", path: "/menu/index" },
//   { name: "Select", path: "/select/index" },
// ]);
const outTouterList = ['components/showCode','components/ReadCode']
</script>

<template>
  <div>
    <header class="fixed top-0 left-0 h-[56px] bg-[#8b5cf6] text-white p-4 w-full line-height-[56px] flex items-center z-[100]">
      <h1 class="text-2xl font-bold ">QuantumUI</h1>
    </header>
    <aside class="fixed top-[56px] left-0 h-full bg-gray-100 p-4 w-[200px] z-[100]">
      <ul>
        <li v-for="item in routerListAll" :key="item.path" >
          <RouterLink v-if="!outTouterList.includes(item.name)" :to="item.path" class="block py-2 px-4 text-gray-800 hover:bg-gray-200">{{ item.name }}</RouterLink>
        </li>
      </ul>
    </aside>

    <main class="fixed top-[56px] left-[200px] h-[calc(100vh-56px)] p-4 w-full bg-white overflow-y-scroll">
      <RouterView />
    </main>
  </div>
</template>

<style scoped></style>
