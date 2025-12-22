import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/main',
        // component: () => import('@/components/Layout'),
        children: [
            {
                path: 'chat',
                name: 'chat',
                component: async () => await import('@/views/Chat')
            },
        ]
    },
    {
        path: '/smartSelect',
        name: 'smartSelect',
        component: async () => await import('@/views/SmartSelect')
    },
    {
        path: '/dropdown',
        name: 'dropdown',
        component: async () => await import('@/views/Dropdown')
    },
    {
        path: '/home',
        name: 'home',
        component: async () => await import('@/views/Home')
    },
    {
        path: '/',
        redirect: '/main/chat'
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
