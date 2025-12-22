import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';
import Layout1, { LayoutName } from '@/layouts/layout1/index.vue';
import { IconCreateZone, IconLearningZone, IconMemories, IconNewChat, IconSettings } from '@quantum/icons';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/prompt-bar',
  },
  {
    path: '/popup',
    name: 'Popup',
    component: () => import('@/views/Popup'),
  },
  {
    path: '/prompt-bar',
    name: 'PromptBar',
    component: () => import('@/views/PromptBar'),
  },
  {
    path: '/main',
    // component: () => import('@/components/Layout'),
    children: [
      {
        path: 'bar',
        name: 'Bar',
        component: () => import('@/views/PromptBar'),
      },
      {
        path: 'chat',
        name: 'Chat',
        component: () => import('@/views/Chat'),
      },
    ],
  },
  {
    path: '/smartSelect',
    name: 'smartSelect',
    component: () => import('@/views/SmartSelect'),
  },
  {
    path: '/smartSelectDropdown',
    name: 'smartSelectDropdown',
    component: () => import('@/views/SmartSelect/SmartSelectDropdown.vue'),
  },
  {
    path: '/dropdown',
    name: 'dropdown',
    component: () => import('@/views/Dropdown'),
  },
  {
    path: '/CameraView/:id',
    name: 'CameraView',
    component: () => import('@/views/Live/LiveVideo'),

  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/Home'),
  },
  {
    path: '/smartEditingPreview',
    name: 'SmartEditingPreview',
    component: () => import('@/views/CreatorZone/smartEditing/index.vue'),
  },
  {
    path: `/${LayoutName.toLocaleLowerCase()}`,
    name: LayoutName,
    component: Layout1,
    children: [
      {
        path: 'chat/:chatId?',
        name: 'FullViewChat',
        component: () => import('@/views/FullViewChat/index.tsx'),
        meta: {
          title: 'New Chat',
          icon: IconNewChat,
          iconClass: 'text-blue-500',
          params: { chatId: '' }
        },
      },
      // Discover 组
      {
        path: 'creator-zone',
        redirect: `/${LayoutName.toLocaleLowerCase()}/creator-zone/home`,
        name: 'CreatorZone',
        component: () => import('@/views/CreatorZone/index.tsx'),
        meta: {
          title: 'Creator Zone',
          icon: IconCreateZone,
          iconClass: 'text-primary',
          group: 'Discover',
          layout: true,
        },
        children: [
          {
            path: 'home',
            name: 'CreatorZoneHome',
            component: () => import('@/views/CreatorZone/home/index.vue'),
          },
          {
            path: 'sticker',
            name: 'CreatorZoneSticker',
            component: () => import('@/views/CreatorZone/sticker/index.vue'),
          },
          {
            path: 'gallery',
            name: 'CreatorZoneGallery',
            component: () => import('@/views/CreatorZone/gallery/index.vue'),
          },
          {
            path: 'editor',
            name: 'CreatorZoneEditor',
            component: () => import('@/views/CreatorZone/editor/index.vue'),
          },
          {
            path: 'avatar',
            name: 'CreatorZoneAvatar',
            component: () => import('@/views/CreatorZone/avatar/index.vue'),
          },
          {
            path: 'create',
            name: 'CreatorZoneCreate',
            children: [
              {
                path: 'session',
                name: 'CreatorZoneSession',
                component: () => import('@/views/CreatorZone/create/session/index.vue'),
              },
              {
                path: 'custom',
                name: 'CreatorZoneCustom',
                component: () => import('@/views/CreatorZone/create/single/index.vue'),
              },
              {
                path: 'scribble',
                name: 'CreatorZoneScribble',
                component: () => import('@/views/CreatorZone/create/single/index.vue'),
              },
            ],
          },
        ],
      },
      // {
      //   path: 'learning-zone',
      //   name: 'LearningZone',
      //   component: () => import('@/views/LearningZone/index.tsx'),
      //   meta: {
      //     title: 'Learning Zone',
      //     icon: IconLearningZone,
      //     iconClass: 'text-primary',
      //     group: 'Discover',
      //   },
      //   children: [
      //     {
      //       path: 'chat:chatId/:cardType?',
      //       name: 'LearningZoneChat',
      //       component: () => import('@/views/LearningZone/Chat/index.vue'),
      //     },
      //   ],
      // },
      // {
      //   path: 'playlist-studio',
      //   name: 'PlaylistStudio',
      //   component: () => import('@/views/PlaylistStudio/index.tsx'),
      //   meta: {
      //     title: 'Playlist Studio',
      //     icon: IconPlaylistStudio,
      //     iconClass: 'text-primary',
      //     group: 'Discover',
      //   },
      // },
      // {
      //   path: 'agents',
      //   name: 'Agents',
      //   component: () => import('@/views/Agents/index.tsx'),
      //   meta: {
      //     title: 'Agents',
      //     icon: IconAgents,
      //     iconClass: 'text-primary',
      //     group: 'Discover',
      //   },
      // },
      {
        path: 'memories',
        name: 'Memories',
        component: () => import('@/views/Memories/index.tsx'),
        meta: {
          title: 'Knowledge',
          icon: IconMemories,
          iconClass: 'text-primary',
          group: 'Discover',
        },
      },
      // {
      //   path: 'history',
      //   name: 'History',
      //   component: () => import('@/views/History/index.tsx'),
      //   meta: {
      //     title: 'History',
      //     icon: IconHistory,
      //     iconClass: 'text-primary',
      //     group: 'Discover',
      //   },
      // },
      {
        path: 'settings',
        name: 'Settings',
        redirect: '/settings',
        meta: {
          title: 'Settings',
          icon: IconSettings,
        },
      },
    ],
  },
  {
    path: '/settings',
    name: 'Settings',
    redirect: '/settings/personal/account',
    component: () => import('@/views/Settings/index.tsx'),
    children: [
      {
        path: 'personal/:anchor',
        name: 'Personal',
        component: () => import('@/views/Settings/Personal'),

        meta: {
          title: 'settings.personal.title',
          subTitle: 'settings.personal.subTitle',

        },
      },
      {
        path: 'general/:anchor',
        name: 'General',
        component: () => import('@/views/Settings/General'),

        meta: {
          title: 'settings.general.title',
          subTitle: 'settings.general.subTitle',

        },
      },
      {
        path: 'dataControl/:anchor',
        name: 'DataControl',
        component: () => import('@/views/Settings/DataControl'),

        meta: {
          title: 'settings.dataControl.title',
          subTitle: 'settings.dataControl.subTitle',

        },
      },
      {
        path: 'about/:anchor',
        name: 'About',
        component: () => import('@/views/Settings/about'),

        meta: {
          title: 'settings.about.title',
          subTitle: 'settings.about.subTitle',

        },
      },
      {
        path: 'personalization/:anchor?',
        name: 'Personalization',
        redirect: '/settings/personalization/personalizationMain',
        component: () => import('@/views/Settings/Personalization'),

        meta: {
          title: 'settings.personalization.title',
          subTitle: 'settings.personalization.subTitle',

        },
        children: [
          {
            path: 'personalizationMain',
            name: 'PersonalizationMain',
            component: () => import('@/views/Settings/personalizationMain'),


          },
          {
            path: 'personalizationDevice/:serverName',
            name: 'PersonalizationDevice',
            component: () => import('@/views/Settings/personalizationDevice'),


          },
          // {
          //   path: 'language',
          //   name: 'Language',
          // }
        ]
      },
      {
        path: 'catchMeUp/:anchor',
        name: 'CatchMeUp',
        component: () => import('@/views/Settings/CatchMeUp'),
        meta: {
          title: 'settings.personalization.CMU',
        },
      },


    ],
    meta: {
      title: 'Settings',
      icon: IconSettings,
    },
  },
  {
    path: '/pay-attention',
    name: 'PayAttention',
    component: () => import('@/views/PayAttention/index.tsx'),
  },
  {
    path: '/OOBE',
    name: 'OOBE',
    component: () => import('@/views/OOBE/index.tsx'),
  },{
    path:'/chat-win',
    name:'ChatWin',
    component: () => import('@/views/ChatWin/index.tsx'),
  },{
    path:"/oobe-bar",
    name:"OobeBar",
    component: () => import('@/views/OOBE/Components/OobeBarPrompt.vue'),
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
