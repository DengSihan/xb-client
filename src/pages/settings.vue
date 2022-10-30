<template>
    <form
		class="mt-4"
        @submit.prevent="updateSettings">

        <xb-input
			class="mb-6"
            type="range"
			name="fixed_audios_volume"
			placeholder="<i class='mdi mdi-volume-high pr-2'></i>固定音频音量"
			v-model.number="form.fixed_audios_volume"
			v-model:errors="errors.fixed_audios_volume"
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
			v-model.number="form.nonfixed_audios_volume"
			v-model:errors="errors.nonfixed_audios_volume"
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

        <xb-button
			class="w-full block mb-6"
			:loading="loading">
			保存设置
			<i class="mdi mdi-content-save pl-1"></i>
		</xb-button>

    </form>
</template>

<script setup>
import { useMeta } from 'vue-meta';
import { useForm } from '~/composables/form.js';
import { useSettings } from '~/store/settings.js';
import { notify } from '@kyvg/vue3-notification';
import axios from '~/plugins/axios.js';

useMeta({
    title: '设置',
});

const settingsStore = useSettings();

const {
    loading,
    form,
    errors,
    handleFormErrors,
    clearFormErrors,
} = useForm({
    ...settingsStore.settings
});

const updateSettings = () => {
    loading.value = true;

    axios.put(`/settings`, form.value)
        .then(({ data }) => {
            settingsStore.setSettings(data);
            clearFormErrors();
            notify({
                title: '设置已保存',
                text: '门店设置已成功保存',
                type: 'success',
            });
        })
        .catch(error => {
            handleFormErrors(error);
        })
        .finally(() => {
            loading.value = false;
        });

};
</script>