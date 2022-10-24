<template>
	<form
		class="my-16"
		@submit.prevent="login">

		<xb-input
			class="mb-6"
			name="company"
			placeholder="<i class='mdi mdi-account-multiple pr-2'></i>公司代码"
			v-model="form.company"
			v-model:errors="errors.company"
			required/>

        <xb-input
			class="mb-6"
			name="username"
			placeholder="<i class='mdi mdi-store pr-2'></i>门店编号"
			v-model="form.code"
			v-model:errors="errors.code"
			required/>

		<xb-input
			class="mb-6"
			name="password"
			type="password"
			placeholder="<i class='mdi mdi-key pr-2'></i>密码"
			v-model="form.password"
			v-model:errors="errors.password"
			required/>

		<xb-button
			class="w-full block mb-6"
			:loading="loading">
			登录
			<i class="mdi mdi-send pl-1"></i>
		</xb-button>

	</form>
</template>

<script setup>
import axios from '~/plugins/axios.js';

import { useForm } from '~/composables/form.js';
import { useAuth } from '~/store/auth.js';

import { useMeta } from 'vue-meta';
import { useRouter } from 'vue-router';


useMeta({
	title: '登录 - 广播云',
});

const router = useRouter();

const auth = useAuth();

const { 
	loading,
	form,
	errors,
	handleFormErrors,
	clearFormErrors,
} = useForm({
    company: '',
	code: '',
	password: '',
});

const login = () => {
	loading.value = true;

	axios.post(`/auth/token`, form.value)
		.then(({ data }) => {
			
			clearFormErrors();
			
			auth.setAuth(data);

			router.push({
				name: 'index',
			});
		})
		.catch(err => {
			handleFormErrors(err);
		})
		.finally(() => {
			loading.value = false;
		});
}
</script>

