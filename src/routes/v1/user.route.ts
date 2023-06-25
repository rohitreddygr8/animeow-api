import { FastifyPluginAsync, RouteHandler } from 'fastify';

import { authRoles } from '../../constants/index.js';
import { userController } from '../../controllers/index.js';
import { auth, validate } from '../../middleware/index.js';
import { userValidation } from '../../validations/index.js';

export const userRouterPlugin: FastifyPluginAsync = async (app) => {
	app.get(
		'/',
		{
			preHandler: [
				auth(authRoles.ADMIN),
				validate(userValidation.getUsersRequestSchema),
			],
		},
		userController.getUsers as RouteHandler,
	);

	app.get(
		'/me',
		{
			preHandler: [auth(authRoles.USER)],
		},
		userController.getMyInfo,
	);

	app.delete(
		'/me',
		{
			preHandler: [auth(authRoles.USER)],
		},
		userController.deleteMyAccount,
	);

	app.delete(
		'/user',
		{
			preHandler: [
				auth(authRoles.ADMIN),
				validate(userValidation.deleteAccountRequestSchema),
			],
		},
		userController.deleteAccount as RouteHandler,
	);
};
