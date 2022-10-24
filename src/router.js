import { createRouter, createWebHistory } from 'vue-router';
import NProgress from 'nprogress';

import guest from '~/middlewares/guest.js';
import auth from '~/middlewares/auth.js';

const routes = [
    
    {
        path: '/login',
        name: 'login',
        component: () => import('~/pages/login.vue'),
        beforeEnter: guest,
    },

    {
        path: '/private-policy',
        name: 'private-policy',
        component: () => import('~/pages/private-policy.vue')
    },

    {
        path: '',
        name: 'index',
        component: () => import('~/pages/index.vue'),
        beforeEnter: auth,
    },
    {
        path: '/profile',
        name: 'profile',
        component: () => import('~/pages/profile.vue'),
        beforeEnter: auth,
    },
    {
        path: '/playlist',
        name: 'playlist',
        component: () => import('~/pages/playlist.vue'),
        beforeEnter: auth,
    },
    {
        path: '/logout',
        name: 'logout',
        component: () => import('~/pages/logout.vue'),
        beforeEnter: auth,
    },
];

let router = createRouter({
	history: createWebHistory(),
	routes,
});

router.beforeEach((to, from, next) => {
	NProgress.start();
	next();
});

router.afterEach(() => {
	NProgress.done();
});

export default router;