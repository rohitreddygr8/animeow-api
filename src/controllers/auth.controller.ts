import { CookieSerializeOptions } from '@fastify/cookie';
import { RouteHandler } from 'fastify';
import { OAuth2Client } from 'google-auth-library';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';

import { authRoles, env } from '../constants/index.js';
import { authService, userService } from '../services/index.js';
import { LoginRequestBody, SignUpRequestBody } from '../types/index.js';
import {
	DatabaseError,
	getHash,
	getHashAndSalt,
	getRandomNumber,
} from '../utils/index.js';

const refreshTokenCookieOptions: CookieSerializeOptions = {
	httpOnly: true,
	secure: !env.IS_DEV,
	sameSite: 'none',
	maxAge: 1000 * 60 * 60 * 24 * 15,
	path: '/v1/auth/refresh-token',
};

export const logOut: RouteHandler = (_request, reply) => {
	reply.clearCookie('refreshToken');
	return reply.status(httpStatus.OK).send();
};

export const logIn: RouteHandler<{ Body: LoginRequestBody }> = async (
	request,
	reply,
) => {
	try {
		const { email, password } = request.body;
		const user = await userService.getUser({ email });
		if (user.password_hash !== getHash(password, user.salt)) {
			return reply.status(httpStatus.UNAUTHORIZED).send('Invalid credentials');
		}
		if (user.is_banned) {
			return reply.status(httpStatus.FORBIDDEN).send('User is banned');
		}
		const accessToken = authService.getAccessToken({
			userId: user.id,
			role: user.role,
		});
		const refreshToken = authService.getRefreshToken({
			userId: user.id,
			role: user.role,
		});
		return reply
			.setCookie('refreshToken', refreshToken, refreshTokenCookieOptions)
			.status(httpStatus.OK)
			.send({ accessToken, role: user.role });
	} catch (err) {
		if (err instanceof DatabaseError) {
			if (err.message === 'does_not_exist') {
				return reply
					.status(httpStatus.UNAUTHORIZED)
					.send('Invalid credentials');
			}
		}

		reply.log.error(err);
		return reply.status(httpStatus.INTERNAL_SERVER_ERROR).send();
	}
};

export const signUp: RouteHandler<{ Body: SignUpRequestBody }> = async (
	request,
	reply,
) => {
	const { email, username, password } = request.body;
	const { hash, salt } = getHashAndSalt(password);

	try {
		const user = await userService.createUser({
			email,
			username:
				username ??
				`${email
					.split('@')[0]
					.substring(0, 9)
					.replace(/[^a-zA-Z0-9\s]/g, '')}${getRandomNumber(0, 10000)}`,
			password_hash: hash,
			salt,
			role: authRoles.USER,
			is_banned: false,
		});
		if (user.is_banned) {
			return reply.status(httpStatus.FORBIDDEN).send('User is banned');
		}
		const accessToken = authService.getAccessToken({
			userId: user.id,
			role: user.role,
		});
		const refreshToken = authService.getRefreshToken({
			userId: user.id,
			role: user.role,
		});
		return reply
			.setCookie('refreshToken', refreshToken, refreshTokenCookieOptions)
			.status(httpStatus.OK)
			.send({ accessToken, role: user.role });
	} catch (err) {
		if (err instanceof DatabaseError) {
			if (err.message === 'already_exists') {
				return reply
					.status(httpStatus.CONFLICT)
					.send('User with this email already exists');
			}
		}
		reply.log.error(err);
		return reply.status(httpStatus.INTERNAL_SERVER_ERROR).send();
	}
};

export const refreshAccessToken: RouteHandler = async (request, reply) => {
	const refreshToken = request.cookies.refreshToken as string;

	try {
		const { sub } = jwt.verify(
			refreshToken,
			env.JWT_REFRESH_TOKEN_SECRET,
		) as jwt.JwtPayload;
		const user = await userService.getUser({ id: sub });
		if (user.is_banned) {
			return reply.status(httpStatus.FORBIDDEN).send('User is banned');
		}
		const accessToken = authService.getAccessToken({
			userId: user.id,
			role: user.role,
		});
		return reply.status(httpStatus.OK).send({ accessToken, role: user.role });
	} catch (err) {
		if (err instanceof DatabaseError) {
			if (err.message === 'does_not_exist') {
				return reply
					.status(httpStatus.UNAUTHORIZED)
					.send('User does not exist');
			}
		}
		if (err instanceof jwt.TokenExpiredError) {
			return reply
				.status(httpStatus.UNAUTHORIZED)
				.send('Refresh token has expired');
		}
		reply.log.error(err);
		return reply
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.send(err instanceof Error && err.message);
	}
};

// const client = new OAuth2Client(CLIENT_ID);

// export const googleLogin: RouteHandler<{ Body: { accessToken: string } }> = (
// 	request,
// 	reply,
// ) => {
// 	async function verify() {
// 		const ticket = await client.verifyIdToken({
// 			idToken: request.body.accessToken,
// 			audience: CLIENT_ID,
// 		});
// 		const payload = ticket.getPayload();
// 		return payload;
// 	}
// 	verify()
// 		.then((payload) => {
// 			console.log(payload);
// 		})
// 		.catch(console.error);

// 	return reply;
// };
