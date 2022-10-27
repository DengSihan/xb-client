<style lang="scss">
.dialog-enter-active {
	transition: all .15s ease;
	.dialog {
		animation: rebound-dialog .2s
	}
}
.dialog-leave-active {
	transition: all .1s ease;
	.dialog {
		transition: all .1s ease;
	}
}

.dialog-enter-from,
.dialog-leave-to {
	opacity: 0;
	.dialog {
		transform: scale(0.7);
	}
}

.dialog.shaking {
	animation: shaking-dialog .15s;
}

@keyframes rebound-dialog {
	0%{
		transform: scale(0.8);
	}
	40%{
		transform: scale(1.02);
	}
	80%{
		transform: scale(.98);
	}
	100%{
		transform: scale(1);
	}
}

@keyframes shaking-dialog {
	0%{
		transform: translateX(10px);
		filter: drop-shadow(0px 0px 0px theme('colors.red.300'));
	}
	25%{
		transform: translateX(-8px);
		filter: drop-shadow(0px 0px 15px theme('colors.red.300'));
	}
	50% {
		transform: translateX(6px);
		filter: drop-shadow(0px 0px 12px theme('colors.red.300'));
	}
	75%{
		transform: translateX(-4px);
		filter: drop-shadow(0px 0px 9px theme('colors.red.300'));
	}
	100%{
		transform: translateX(0px);
		filter: drop-shadow(0px 0px 0px theme('colors.red.300'));
	}
}
</style>

<template>

    <teleport
        to="#app">

        <transition
            name="dialog">

            <div
				v-if="show"
				class="select-none absolute z-20 top-0 bottom-0 left-0 right-0 bg-slate-800/25 backdrop-blur overflow-y-auto">
                <dialog
					class="
						dialog relative mx-auto rounded p-0 transition-[transform,filter] bg-white shadow
						top-1/4
						w-[calc(100%-theme('space.8'))]
					"
					open>
					<header
						class="text-xl font-bold p-6">
						<span
							class="mr-2">
							😥
						</span>
						抱歉，麻烦您点一下
					</header>
					<p
						class="px-6 pb-6">
						浏览器已禁止自动播放音频，请点击下方按钮，继续播放音频。使用客户端，可跳过此步骤。
					</p>
					<form
						class="px-6 pb-6 text-sm text-right"
						@submit.prevent="continuePlay">
						<xb-button>
							继续播放
							<i
								class="mdi mdi-play-circle ml-2"></i>
						</xb-button>
					</form>
				</dialog>
            </div>

        </transition>
    
    </teleport>
    
</template>

<script setup>

import { computed } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true,
    }
});

const emits = defineEmits([
    'update:modelValue',
	'interact'
]);

const show = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emits('update:modelValue', value);
    }
});

const continuePlay = () => {
	emits('interact');
}

</script>