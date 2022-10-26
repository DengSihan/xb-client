<template>

    <teleport
        to="#app">

        <transition
            name="dialog">

            <div
				v-if="show"
				class="select-none absolute z-50 top-0 bottom-0 left-0 right-0 bg-slate-800/25 backdrop-blur overflow-y-auto">
                <dialog
					class="
						dialog relative mx-auto rounded p-0 transition-[transform,filter] bg-white shadow
						my-4 sm:my-4 md:my-8 lg:my-16
						w-[calc(100%-theme('space.4'))] sm:w-[calc(100%-theme('space.4'))] md:w-2/3 lg:w-[520px]
					"
					open>

					<header
						class="relative border-b-2 border-slate-200">
						<h3
							class="mr-16 px-6 text-lg font-bold h-16 leading-[4rem]">
							<slot
								name="title"/>
						</h3>
					</header>

					<section
						class="p-6">
						<slot/>
					</section>
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
    'update:modelValue'
]);

const show = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emits('update:modelValue', value);
    }
});

</script>