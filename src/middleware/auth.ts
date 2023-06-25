import { preHandlerAsyncHookHandler } from 'fastify';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';

import { authRoles, env } from '../constants/index.js';
import { userService } from '../services/index.js';
import { AuthRole } from '../types/index.js';
import { DatabaseError } from '../utils/index.js';

export const auth = (requiredAuthRole: AuthRole) => {
	const fn: preHandlerAsyncHookHandler = async (request, reply) => {
		try {
			const { authorization } = request.headers;
			if (!authorization || !authorization.startsWith('Bearer ')) {
				return reply.status(httpStatus.UNAUTHORIZED).send();
			}
			const { sub } = jwt.verify(
				authorization.split(' ')[1],
				env.JWT_ACCESS_TOKEN_SECRET,
			) as jwt.JwtPayload;

			const user = await userService.getUser({ id: sub });
			const roles = Object.values(authRoles);
			const hasAccess =
				roles.indexOf(user.role) >= roles.indexOf(requiredAuthRole) &&
				!user.is_banned;
			if (!hasAccess) {
				return reply
					.status(httpStatus.FORBIDDEN)
					.send('You do not have access to this resource');
			}

			request.user = user;
			return;
		} catch (err) {
			if (
				(err instanceof DatabaseError && err.message === 'does_not_exist') ||
				err instanceof jwt.TokenExpiredError
			) {
				return reply
					.status(httpStatus.UNAUTHORIZED)
					.send('Invalid credentials');
			}
			return reply.status(httpStatus.INTERNAL_SERVER_ERROR).send();
		}
	};
	return fn;
};
