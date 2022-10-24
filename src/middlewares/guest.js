import { useAuth } from '~/store/auth.js';

const guest = async (to, from, next) => {

	await useAuth().refreshAuth();

	if (Object.keys(useAuth().store).length > 0) {
		next({
			name: 'index'
		});
	}
	else {
		next();
	}
}

export default guest;