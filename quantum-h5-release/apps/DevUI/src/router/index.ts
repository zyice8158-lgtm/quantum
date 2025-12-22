import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const viewModules = import.meta.glob('../views/**/*.(tsx|vue)')

// console.log('viewModules', viewModules)
const routes:RouteRecordRaw[] = []
for(const key in viewModules){
  const name = key.replace('../views', '').replace('.tsx', '').replace('.vue', '').replace('/','')
  routes.push({
    path: '/' + name,
    name: name,
    component: viewModules[key],
  })
}
routes.unshift({
  path: '/',
  redirect: routes[0].path
})

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: routes
})

export default router
