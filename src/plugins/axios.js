import axios from 'axios';
import router from '~/router.js';
import { useAuth } from '~/store/auth.js';
import { version } from '../../package.json';
import { usePlatform } from '~/utils/platform.js';
import { notify } from '@kyvg/vue3-notification';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.headers.common['X-Client-Version'] = `v${version}-${usePlatform()}`;

// before sending the request
axios.interceptors.request.use(
	config => {

		let token = useAuth().token;
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	error => {
		
		return Promise.reject(error);
	}
);

// after getting the response
axios.interceptors.response.use(
	response => {

		return response;
	},
	error => {

		let { response } = error;

		if (response.status === 401) {
            
			useAuth().clearAuth();

			router.push({
				name: 'login'
			});
		}

		notify({
			title: `${response.status} ${response?.statusText}`,
			text: response.data.message,
			type: 'danger'
		});

		return Promise.reject(error);
	}
);

export default axios;