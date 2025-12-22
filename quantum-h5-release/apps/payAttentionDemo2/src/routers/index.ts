import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: "/main",
    // component: () => import('@/components/Layout'),
    children: [
      {
        path: "chat",
        name: "chat",
        component: async () => await import("@/views/Chat/Chat.vue"),
      },
      {
        path: "speech",
        name: "speech",
        component: async () => await import("@/views/azureSpeech/index.vue"),
      },
      {
        path: "talk",
        name: "talk",
        component: async () => await import("@/views/talkingUser/index.vue"),
      },
    ],
  },
  {
    path: "/",
    redirect: "/main/speech",
  },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
