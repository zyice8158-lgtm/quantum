import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/loading',
    },
    {
      path: '/loading',
      name: 'InitLoading',
      component: () => import('../views/Loading/index.tsx'),
    }
  ],
})

export default router