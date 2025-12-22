import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/test-for-services',
    },
    {
      path: '/test-for-services',
      name: 'TestForServices',
      component: () => import('../views/TestForServices/index.tsx'),
    }
  ],
})

export default router