<template>
    <notifications
        class="mb-2"
        style="position: absolute;"
        position="bottom center"
        width="400px"
        :max="1"
        :duration="6000">
        <template
            #body="{ item, close }">
            <div
                class="shadow p-2 rounded my-1 relative min-h-[3.6rem] w-full bg-[#272822] text-slate-100"
                role="alert">
                <div
                    class="w-[calc(100%-2.5rem)] px-2">
                    <h5
                        v-if="item.title"
                        class="text-md leading-8 font-bold"
                        :class="{
                            'mb-2': item.text
                        }">
                        <i
                            v-if="item.type"
                            class="mr-2"
                            :class="{
                                'text-green-600 mdi mdi-check': item.type === 'success',
                                'text-red-600 mdi mdi-close': item.type === 'danger'
                            }"></i>

                        {{ item.title }}
                    </h5>
                    <p
                        class="text-[90%]"
                        v-html="item.text"/>
                </div>
                <span
                    class="absolute right-2 top-1/2 translate-y-[-50%]">
                    <button
                        type="button"
                        @click="close"
                        class="rounded w-10 h-10 block "
                        aria-label="关闭提示框"
                        v-wave>
                        <i class="mdi mdi-close text-xl"></i>
                    </button>
                </span>
            </div>
        </template>
    </notifications>
</template>