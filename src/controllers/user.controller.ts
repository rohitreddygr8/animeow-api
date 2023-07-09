import { RouteHandler } from 'fastify';
import httpStatus from 'http-status';

import { userService } from '../services/index.js';
import {
	DeleteAccountRequestBody,
	GetUsersRequestQuery,
} from '../types/index.js';
import { DatabaseError } from '../utils/index.js';

export const getUsers: RouteHandler<{
	Querystring: GetUsersRequestQuery;
}> = async (request, reply) => {
	try {
		const users = await userService.getUsers({ ...request.query });
		return reply.status(httpStatus.OK).send(users);
	} catch (err) {
		if (err instanceof DatabaseError) {
			if (err.message === 'does_not_exist') {
				return reply
					.status(httpStatus.UNAUTHORIZED)
					.send('User does not exist');
			}
		}
		reply.log.error(err);
		return reply.status(httpStatus.INTERNAL_SERVER_ERROR).send();
	}
};

export const getMyInfo: RouteHandler = async (request, reply) => {
	return reply.status(httpStatus.OK).send(request.user);
};

export const deleteMyAccount: RouteHandler = async (request, reply) => {
	await userService.deleteUser({ id: request.user.id });
	return reply.status(httpStatus.NO_CONTENT).send();
};

export const deleteAccount: RouteHandler<{
	Body: DeleteAccountRequestBody;
}> = async (request, reply) => {
	await userService.deleteUser({ id: request.body.userId });
	return reply.status(httpStatus.NO_CONTENT).send();
};

export const updateProfilePicture: RouteHandler = async (request, reply) => {
	const file = await request.file();
	if (!file) {
		return reply.status(httpStatus.BAD_REQUEST).send();
	}
	const url = await userService.updateUserProfilePicture(file, request.user.id);
	await userService.updateUserById(request.user.id, { image_url: url });
	return reply.status(httpStatus.CREATED).send();
};
