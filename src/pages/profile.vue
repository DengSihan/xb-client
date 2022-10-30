<template>
    <form
        class="mt-4"
        @submit.prevent="updateProfile">
        
        <xb-input
			class="mb-6"
			name="name"
			placeholder="门店名称"
			v-model="form.name"
			v-model:errors="errors.name"
			required/>

		<xb-input
			class="mb-6"
			name="open_at"
			placeholder="开始营业时间"
			type="time"
			v-model="form.open_at"
			v-model:errors="errors.open_at"
			required/>

		<xb-input
			class="mb-6"
			name="close_at"
			placeholder="结束营业时间"
			type="time"
			v-model="form.close_at"
			v-model:errors="errors.close_at"
			required/>

        <xb-button
			:loading="loading"
			class="w-full block mb-6">
			更新门店信息
		</xb-button>

    </form>
</template>

<script setup>
import { useMeta } from 'vue-meta';
import { useForm } from '~/composables/form.js';
import { useAuth } from '~/store/auth.js';
import { notify } from '@kyvg/vue3-notification';
import { pick } from 'lodash';
import axios from '~/plugins/axios.js';

useMeta({
    title: '门店信息',
});

const authStore = useAuth();

const {
    loading,
    form,
    errors,
    handleFormErrors,
    clearFormErrors,
} = useForm(
    pick(
        authStore.store,
        ['name', 'open_at', 'close_at']
    )
);

const updateProfile = () => {
    loading.value = true;
    axios.put(`/auth/store`, form.value)
        .then(({ data }) => {
            authStore.updateStore(data);
            clearFormErrors();
            notify({
                title: '更新成功',
                text: '门店信息已成功更新',
                type: 'success',
            });
        })
        .catch(handleFormErrors)
        .finally(() => {
            loading.value = false;
        });
}


</script>