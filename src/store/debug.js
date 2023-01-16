import { defineStore } from 'pinia';
import dayjs from 'dayjs';

export const useDebug = defineStore('debug', {
    state: () => {
        return {
            _info: {
                last_response_time: null,
                last_version_check_time: null,
                last_login_time: null,
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