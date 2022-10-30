import { defineStore } from 'pinia';
import { useAuth } from '~/store/auth.js';

export const useSettings = defineStore('settings', {
    state: () => {

        let { store } = useAuth();

        

        return {
            _settings: {
                fixed_audios_volume: 1,
                nonfixed_audios_volume: 1,
                ...(store.settings ?? {}),
            },
        };
    },
    getters: {
        settings: state => state._settings,
    },
    actions: {
        setSettings(settings) {
            this._settings = {
                ...this._settings,
                ...settings
            };
        }
    }
});