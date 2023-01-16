import axios from 'axios';
import router from '~/router.js';
import { useAuth } from '~/store/auth.js';
import { useDebug } from '~/store/debug.js';
import { version } from '../../package.json';
import { usePlatform } from '~/utils/platform.js';
import { notify } from '@kyvg/vue3-notification';
import dayjs from 'dayjs';

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

		console.log(response.request.responseURL)

		if (
			response.request.responseURL.includes('/api/')
			&& !response.request.responseURL.includes('/api/auth/tokens')
		) {
			useDebug().update({
				last_response_time: dayjs().format('YYYY-MM-DD HH:mm:ss')
			});
		}

		if (
			response.request.responseURL.includes('/app.json?time=')
		) {
			useDebug().update({
				last_version_check_time: dayjs().format('YYYY-MM-DD HH:mm:ss')
			});
		}

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