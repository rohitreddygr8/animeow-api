import { preHandlerAsyncHookHandler } from 'fastify';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';

import { authRoles, env } from '../constants/index.js';
import { userService } from '../services/index.js';
import { AuthRole } from '../types/index.js';
import { DatabaseError } from '../utils/index.js';
import { userValidation } from '../validations/index.js';

export const checkAuth = (requiredAuthRole: AuthRole) => {
	const fn: preHandlerAsyncHookHandler = async (request, reply) => {
		try {
			const { authorization } = request.headers;
			if (!authorization || !authorization.startsWith('Bearer ')) {
				return reply.status(httpStatus.UNAUTHORIZED).send();
			}
			const token = jwt.verify(
				authorization.split(' ')[1],
				env.JWT_ACCESS_TOKEN_SECRET,
			) as jwt.JwtPayload;
			const parsed = userValidation.authRoleSchema.safeParse(token.role);
			if (!parsed.success) {
				return reply.status(httpStatus.UNAUTHORIZED).send();
			}
			const roles = Object.values(authRoles);
			const hasAccess =
				roles.indexOf(parsed.data) >= roles.indexOf(requiredAuthRole);
			if (!hasAccess) {
				return reply.status(httpStatus.FORBIDDEN).send();
			}
			const user = await userService.getUser({ id: token.sub });
			if (user.is_banned) {
				return reply.status(httpStatus.FORBIDDEN).send();
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
