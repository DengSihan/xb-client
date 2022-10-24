<template>
    <form
        class="my-32"
        @submit.prevent="logout">
        <p
            class="my-4 text-lg font-bold ">
            您确定要退出当前登录？
        </p>
        <xb-button
            scheme="danger">
            <i class="mdi mdi-logout-variant mr-2"></i>
            退出登录
        </xb-button>
    </form>
</template>

<script setup>
import { useAuth } from '~/store/auth.js';
import { useRouter } from 'vue-router';
import { notify } from '@kyvg/vue3-notification';

const auth = useAuth(),
    router = useRouter();

const logout = async () => {

    await auth.destroyAuth();

    notify({
        title: '注销成功',
        text: '您已退出当前登录',
        type: 'success',
    });

    router.push({
        name: 'login'
    });
};

</script>