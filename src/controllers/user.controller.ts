import { RouteHandler } from 'fastify';
import httpStatus from 'http-status';

import { env } from '../constants/index.js';
import { fileService, userService } from '../services/index.js';
import {
	DeleteAccountRequestBody,
	GetUsersRequestQuery,
} from '../types/index.js';
import { DatabaseError, getRandomHexString } from '../utils/index.js';

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
	const key =
		request.user.image_url && request.user.image_url.split('/').at(-1);
	if (key) {
		await fileService.deleteImageFromBucket({
			bucket: env.S3_BUCKET_NAME,
			key,
		});
	}
	const url = await fileService.uploadImageToBucket({
		key: `${request.user.id}${getRandomHexString().slice(0, 10)}.${file.mimetype
			.split('/')
			.at(-1)}`,
		body: await file.toBuffer(),
	});
	await userService.updateUserById(request.user.id, { image_url: url });
	return reply.status(httpStatus.CREATED).send();
};

export const deleteProfilePicture: RouteHandler = async (request, reply) => {
	const key =
		request.user.image_url && request.user.image_url.split('/').at(-1);
	if (key) {
		await fileService.deleteImageFromBucket({
			bucket: env.S3_BUCKET_NAME,
			key,
		});
		await userService.updateUserById(request.user.id, { image_url: undefined });
	}
	return reply.status(httpStatus.OK).send();
};
