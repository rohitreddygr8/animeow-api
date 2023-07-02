import { FastifyPluginAsync, RouteHandler } from 'fastify';

import { appController } from '../../controllers/index.js';
import { checkAuth, validate } from '../../middleware/index.js';
import { appValidation } from '../../validations/index.js';

export const appRouterPlugin: FastifyPluginAsync = async (app) => {
	app.get('/is-streaming-enabled', appController.getIsStreamingEnabled);

	app.put(
		'/is-streaming-enabled',
		{
			preHandler: [
				checkAuth('admin'),
				validate(appValidation.setIsStreamingEnabledRequestSchema),
			],
		},
		appController.setIsStreamingEnabled as RouteHandler,
	);
};
