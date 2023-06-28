import { FastifyPluginAsync, RouteHandler } from 'fastify';

import { authRoles } from '../../constants/index.js';
import { authController } from '../../controllers/index.js';
import { checkAuth, validate } from '../../middleware/index.js';
import { authValidation } from '../../validations/index.js';

export const authRouterPlugin: FastifyPluginAsync = async (app) => {
	app.post(
		'/log-in',
		{ preHandler: validate(authValidation.logInRequestSchema) },
		authController.logIn as RouteHandler,
	);

	app.post(
		'/log-out',
		{ preHandler: checkAuth(authRoles.USER) },
		authController.logOut as RouteHandler,
	);

	app.post(
		'/sign-up',
		{ preHandler: validate(authValidation.signUpRequestSchema) },
		authController.signUp as RouteHandler,
	);

	app.get(
		'/refresh-token',
		{ preHandler: [validate(authValidation.refreshTokenRequestSchema)] },
		authController.refreshAccessToken as RouteHandler,
	);
};
