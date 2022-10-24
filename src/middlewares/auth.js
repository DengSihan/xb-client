import { useAuth } from '~/store/auth.js';

const auth = async (to, from, next) => {

	await useAuth().refreshAuth();

	if (Object.keys(useAuth().store).length > 0) {
		next();
	}
	else {
		next({
			name: 'login'
		});
	}
}

export default auth;