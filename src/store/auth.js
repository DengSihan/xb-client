import { defineStore } from 'pinia';
import axios from '~/plugins/axios.js';
import Cookie from 'js-cookie';

export const useAuth = defineStore('auth', {

	state: () => {
		return {
			_store: {},
			_token: Cookie.get('token') ?? null,
		};
	},

	getters: {
		store: state => state._store,
		token: state => state._token,
	},

	actions: {
		setAuth({ token, store }) {
			this._token = token;		
			this._store = store;
			Cookie.set('token', token, {expires: 365});
		},
		async refreshAuth() {
			if (
				this.token
				&& Object.keys(this.store).length === 0
			) {
				try{
					let { data } = await axios.get('/auth/store', {
						headers: {
							'Authorization': `Bearer ${this.token}`
						}
					});
					this.setAuth({
						token: this.token,
						store: data,
					});
				}
				catch(error) {
					this.clearAuth();
				}
			}
		},
		async destroyAuth() {
			await axios.delete('/auth/token', {
				headers: {
					'Authorization': `Bearer ${this.token}`
				}
			});
			this.clearAuth();
		},
		clearAuth() {
			this._token = null;
			this._store = {};
			Cookie.remove('token');
		},
		updateSettings(settings) {
			this._store.settings = settings;
		},
		updateStore(store) {
			this._store = store;
		}
	},
});