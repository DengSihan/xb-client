<template>
	<metainfo>
		<template
			v-slot:title="{ content, metainfo }">
			{{
				metainfo?.titleTemplate
					? metainfo.titleTemplate.replace('%s', content)
					: content
			}}
		</template>
	</metainfo>
	<notifications-wrapper/>
	<dashboard/>
</template>

<script setup>
import NotificationsWrapper from '~/components/notifications-wrapper.vue';
import Dashboard from '~/components/dashboard.vue';

import { useMeta } from 'vue-meta';
import { onMounted, onBeforeUnmount } from 'vue';
import { randomIntFromInterval } from '~/utils/helpers.js';
import axios from '~/plugins/axios.js';
import { last_updated_at } from '../package.json';
import { notify } from '@kyvg/vue3-notification';

useMeta({
	titleTemplate: '%s - 广播云',
});

let clientUpdateChecker = null;

onMounted(() => {
	clientUpdateChecker = setInterval(
		() => {
			axios.get(`${location.origin}/app.json?time=${(new Date()).getTime()}`)
				.then(({ data }) => {
					if (data.last_updated_at !== last_updated_at) {
						notify({
							title: '发现新版本',
							text: '即将刷新页面以更新',
						});
						setTimeout(() => {
							location.reload();
						}, randomIntFromInterval(3000, 6000));
					}
				});
		},
		// 2 分钟 - 5 分钟内任意时间检查 client 是否更新
		randomIntFromInterval(1000 * 60 * 2, 1000 * 60 * 5)
	);
});

onBeforeUnmount(() => {
	if (clientUpdateChecker) {
		clearInterval(clientUpdateChecker);
	}
});
</script>