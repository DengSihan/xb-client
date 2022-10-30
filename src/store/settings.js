import { defineStore } from 'pinia';
import { useAuth } from '~/store/auth.js';

export const useSettings = defineStore('settings', {
    state: () => {

        let authStore = useAuth();

        return {
            _settings: {
                fixed_audios_volume: 1,
                nonfixed_audios_volume: 1,
                ...(authStore.store.settings ?? {}),
            },
        };
    },
    getters: {
        settings: state => state._settings,
    },
    actions: {
        update(settings) {
            this._settings = settings;
        }
    }
});