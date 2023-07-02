import { RouteHandler } from 'fastify';
import httpStatus from 'http-status';

import { appService } from '../services/index.js';
import { SetIsStreamingEnabledRequestQuery } from '../types/index.js';

export const getIsStreamingEnabled: RouteHandler = async (request, reply) => {
	try {
		const data = await appService.getIsStreamingEnabled();
		return reply.status(httpStatus.OK).send({ is_streaming_enabled: data });
	} catch (err) {
		return reply.status(httpStatus.OK).send({ is_streaming_enabled: false });
	}
};

export const setIsStreamingEnabled: RouteHandler<{
	Body: SetIsStreamingEnabledRequestQuery;
}> = async (request, reply) => {
	try {
		await appService.setIsStreamingEnabled(request.body.is_enabled);
		return reply.status(httpStatus.OK).send();
	} catch (err) {
		console.log(err);

		return reply.status(httpStatus.INTERNAL_SERVER_ERROR).send();
	}
};
