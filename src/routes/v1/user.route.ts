import { FastifyPluginAsync, RouteHandler } from 'fastify';

import { authRoles } from '../../constants/index.js';
import { userController } from '../../controllers/index.js';
import { checkAuth, validate } from '../../middleware/index.js';
import { userValidation } from '../../validations/index.js';

export const userRouterPlugin: FastifyPluginAsync = async (app) => {
	app.get(
		'/',
		{
			preHandler: [
				checkAuth(authRoles.ADMIN),
				validate(userValidation.getUsersRequestSchema),
			],
		},
		userController.getUsers as RouteHandler,
	);

	app.get(
		'/me',
		{
			preHandler: [checkAuth(authRoles.USER)],
		},
		userController.getMyInfo,
	);

	app.delete(
		'/me',
		{
			preHandler: [checkAuth(authRoles.USER)],
		},
		userController.deleteMyAccount,
	);

	app.delete(
		'/user',
		{
			preHandler: [
				checkAuth(authRoles.ADMIN),
				validate(userValidation.deleteAccountRequestSchema),
			],
		},
		userController.deleteAccount as RouteHandler,
	);

	app.put(
		'/profile-picture',
		{ preHandler: [checkAuth(authRoles.USER)] },
		userController.updateProfilePicture,
	);

	app.delete(
		'/profile-picture',
		{ preHandler: [checkAuth(authRoles.USER)] },
		userController.deleteProfilePicture,
	);
};
