import { defineStore } from 'pinia';

export const useDebug = defineStore('debug', {
    state: () => {
        return {
            _info: {
                last_response_time: null,
                last_version_check_time: null,
            }
        }
    },
    getters: {
        info: state => state._info,
    },
    actions: {
        update(info) {
            this._info = {
                ...this._info,
                ...info,
            };
        }
    }
});