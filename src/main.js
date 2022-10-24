import '~/assets/index.scss';

// @mdi/font
import '@mdi/font/css/materialdesignicons.min.css';

import 'xb-design/dist/style.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createMetaManager } from 'vue-meta';
import Notifications from '@kyvg/vue3-notification';
import App from '~/App.vue';

const metaManager = createMetaManager();

import xiangdui from 'xb-design';
import router from '~/router.js';

const app = createApp(App)
	.use(createPinia())
	.use(xiangdui)
	.use(Notifications)
	.use(router)
	.use(metaManager)
	.mount('#app');