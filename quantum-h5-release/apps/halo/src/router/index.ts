import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/for-prompt-bar',
    },
    {
      path: '/for-prompt-bar',
      name: 'ForPromptBar',
      component: () => import('../views/ForPromptBar/index.tsx'),
    }
  ],
})

export default router