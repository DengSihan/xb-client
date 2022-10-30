<template>
    <form
		class="mt-4"
        @submit.prevent="() => {}">

        <xb-input
			class="mb-6"
            type="range"
			name="fixed_audios_volume"
			placeholder="<i class='mdi mdi-volume-high pr-2'></i>固定音频音量"
			v-model.number="computedSettings.fixed_audios_volume"
			required
            step="0.01"
            max="1"
            min="0"
            list="fixed_audios_volume"/>
        <datalist
            id="fixed_audios_volume"
            class="flex w-[105%] relative top-[-2rem]">
            <option
                class="text-xs flex-1"
                :value="0"
                :label="0"></option>
            <option
                class="text-xs flex-1"
                v-for="i in 10"
                :value="i * 0.1"
                :label="i * 10"></option>
        </datalist>

        <xb-input
			class="mb-6"
            type="range"
			name="nonfixed_audios_volume"
			placeholder="<i class='mdi mdi-volume-high pr-2'></i>背景与促销音频音量"
			v-model.number="computedSettings.nonfixed_audios_volume"
			required
            step="0.01"
            max="1"
            min="0"
            list="nonfixed_audios_volume"/>
        <datalist
            id="nonfixed_audios_volume"
            class="flex w-[105%] relative top-[-2rem]">
            <option
                class="text-xs flex-1"
                :value="0"
                :label="0"></option>
            <option
                class="text-xs flex-1"
                v-for="i in 10"
                :value="i * 0.1"
                :label="i * 10"></option>
        </datalist>

    </form>
</template>

<script setup>
import { useMeta } from 'vue-meta';
import { useSettings } from '~/store/settings.js';
import { useAuth } from '~/store/auth.js';
import { onBeforeUnmount, computed } from 'vue';
import { isEqual } from 'lodash';
import axios from '~/plugins/axios.js';

useMeta({
    title: '设置',
});

const settingsStore = useSettings();
const authStore = useAuth();

const previousSettings = computed(() => {
    return authStore.store.settings;
});

const computedSettings = computed({
    get() {
        return settingsStore.settings;
    },
    set(value) {
        settingsStore.update(value);
    },
});

const isChangeSettings = computed(() => {
    return !isEqual(previousSettings.value, computedSettings.value);
});

onBeforeUnmount(() => {
    if (isChangeSettings.value) {
       axios.put(`/settings`, computedSettings.value)
            .then(({ data }) => {
                authStore.updateSettings(data);
            });
    }
});
</script>