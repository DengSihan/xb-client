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

useMeta({
	titleTemplate: '%s - 广播云',
})
</script>