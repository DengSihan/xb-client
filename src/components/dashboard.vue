<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>


<template>

    <div
        v-if="platform === 'app'"
        id="electron-header"
        class="h-8 bg-slate-900 text-slate-100 rounded-t flex">
        <div
            id="electron-header-drag"
            class="cursor-pointer w-[calc(100%-theme('space.20'))] h-full block">
        </div>
        <div
            class="w-20">
            <button
                type="button"
                class="h-8 w-8 mr-2"
                @click="minElectron">
                <i
                    class="mdi mdi-minus"></i>
            </button>
            <button
                type="button"
                class="h-8 w-8"
                @click="closeElectron">
                <i
                    class="mdi mdi-close"></i>
            </button>
        </div>
    </div>

    <header
        id="app-header"
        class="h-16 p-4 flex justify-between">

        <button
            @click="activeSidebar = !activeSidebar"
            type="button"
            class="w-10 h-10 rounded scale-100 hover:scale-[102%] active:scale-[98%]"
            v-wave>
            <i
                class="mdi mdi-menu text-xl"></i>
        </button>

        
    </header>

	<aside
		class="
			w-2/3
			h-full
			absolute top-0 left-0 z-30
            transition-all duration-100
			bg-slate-50
		"
		:class="[
			activeSidebar
				? 'translate-x-0'
				: '-translate-x-full'
		]">

        <router-link
			:to="{
				name: 'index',
			}"
			custom
			v-slot="{ href, navigate }">
			<a
				class="flex items-center font-bold text-lg tracking-widest h-16 px-4 border-b"
				:href="href"
				@click.prevent="nav(navigate)">
				<img
					class="w-8 h-8 mr-4"
					src="/logo.png">
				广播云
			</a>
		</router-link>

        <nav
			class="overflow-y-auto p-4"
            :class="[
                authed
                    ? `h-[calc(100%-10.5rem)]`
                    : `h-[calc(100%-theme('space.28'))] `
            ]">

            <template
                v-if="!authed">
                <router-link
                    :to="{
                        name: 'login'
                    }"
                    custom
                    v-slot="{ isActive, href, navigate, route }">
                    <a
                        class="block p-3 mb-2 rounded"
                        :href="href"
                        :class="[
                            (isActive || $route.path.startsWith(route.fullPath) )
                                ? 'bg-slate-200 text-slate-900'
                                : 'bg-slate-50 hover:bg-slate-200 text-slate-700'
                        ]"
                        @click.prevent="nav(navigate)"
                        v-wave>
                        <i
                            class="mdi mdi-login-variant mr-2"></i>
                        登录
                    </a>
                </router-link>
            </template>
            <template
                v-else>
                <router-link
                    :to="{
                        name: 'playlist'
                    }"
                    custom
                    v-slot="{ isActive, href, navigate, route }">
                    <a
                        class="block p-3 mb-2 rounded"
                        :href="href"
                        :class="[
                            (isActive || $route.path.startsWith(route.fullPath) )
                                ? 'bg-slate-200 text-slate-900'
                                : 'bg-slate-50 hover:bg-slate-200 text-slate-700'
                        ]"
                        @click.prevent="nav(navigate)"
                        v-wave>
                        <i
                            class="mdi mdi-playlist-music mr-2"></i>
                        播放列表
                    </a>
                </router-link>
                <router-link
                    :to="{
                        name: 'profile'
                    }"
                    custom
                    v-slot="{ isActive, href, navigate, route }">
                    <a
                        class="block p-3 mb-2 rounded"
                        :href="href"
                        :class="[
                            (isActive || $route.path.startsWith(route.fullPath) )
                                ? 'bg-slate-200 text-slate-900'
                                : 'bg-slate-50 hover:bg-slate-200 text-slate-700'
                        ]"
                        @click.prevent="nav(navigate)"
                        v-wave>
                        <i
                            class="mdi mdi-store mr-2"></i>
                        门店信息
                    </a>
                </router-link>
            </template>

        </nav>

        <nav
            v-if="authed"
            class="h-14 px-4">
            <router-link
                :to="{
                    name: 'logout'
                }"
                custom
                v-slot="{ isActive, href, navigate, route }">
                <a
                    class="block p-3 rounded"
                    :href="href"
                    :class="[
                        (isActive || $route.path.startsWith(route.fullPath) )
                            ? 'bg-red-100 text-red-900'
                            : 'bg-red-50 hover:bg-red-100 text-red-700'
                    ]"
                    @click.prevent="nav(navigate)"
                    v-wave>
                    <i
                        class="mdi mdi-logout-variant mr-2"></i>
                    退出登录
                </a>
            </router-link>
        </nav>

        <footer
            class="h-12 text-xs text-slate-600 flex items-center justify-center px-4">
            Copyright © {{ year }} 重庆相对科技有限公司
        </footer>

	</aside>

    <transition
        name="fade">
        <div
            v-if="activeSidebar"
            @click="activeSidebar = false"
            aria-label="隐藏侧边栏"
            class="
                cursor-pointer
                block
                backdrop-blur bg-slate-900/10
                absolute top-0 left-0 z-20
                w-full h-full
            "/>
    </transition>
	

	<main
        class="px-6 overflow-y-auto"
        :class="[
            authed
                ? (platform === 'app' ? `h-[calc(100%-theme('space.60'))]` : `h-[calc(100%-theme('space.52'))]`)
                : (platform === 'app' ? `h-[calc(100%-theme('space.36'))]` : `h-[calc(100%-theme('space.28'))]`)
        ]">
		<router-view/>
	</main>

    <template
        v-if="authed">
        <player/>
    </template>

    <footer
        class="h-12">
        <p
            class="text-xs py-4 flex items-center justify-center">
            <img
                class="w-4 h-4 mr-2"
                src="/logo-xs.png">
            广播云 Copyright © {{ year }} 重庆相对科技有限公司 v{{ version }}
        </p>
    </footer>


</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuth } from '~/store/auth.js';
import { version } from '../../package.json';
import { usePlatform } from '~/utils/platform.js';
import Player from '~/components/player/index.vue';

const auth = useAuth();
const platform = usePlatform();

const authed = computed(() => Object.keys(auth.store).length > 0);

const activeSidebar = ref(false);

const year = new Date().getFullYear();

const nav = (navigate) => {
    activeSidebar.value = false;
    navigate();
};


if (platform === 'app') {
    const { ipcRenderer } = require('electron');
    window.ipcRenderer = ipcRenderer;
}

const minElectron = () => {
    console.log('min');
    window.ipcRenderer.send('minimize-app');
}

const closeElectron = () => {
    if (confirm(`确认退出？`)) {
        window.ipcRenderer.send('close-app');
    }
}

</script>

<script>
export default {
    inheritAttrs: false,
};
</script>