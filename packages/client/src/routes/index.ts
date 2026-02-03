import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    redirect: { name: 'UppersList' },
  },
  // Uppers
  {
    path: '/uppers/list',
    name: 'UppersList',
    component: () => import('../views/uppers/list/index.vue'),
  },
  {
    path: '/uppers/detail',
    name: 'UppersDetail',
    component: () => import('../views/uppers/detail/index.vue'),
  },
  // Videos
  {
    path: '/videos/detail',
    name: 'VideosDetail',
    component: () => import('../views/videos/detail/index.vue'),
  },
  // Calendar
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('../views/calendar/index.vue'),
  },
  {
    path: '/calendar/detail',
    name: 'DailyReportDetail',
    component: () => import('../views/calendar/detail/index.vue'),
  },
  // Settings
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/settings/index.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
