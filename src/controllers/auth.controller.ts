import { CookieSerializeOptions } from '@fastify/cookie';
import { RouteHandler } from 'fastify';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';

import { authRoles, env } from '../constants/index.js';
import { authService, userService } from '../services/index.js';
import {
	GetResetPasswordRequestQuery,
	LoginRequestBody,
	PostResetPasswordRequestBody,
	PostResetPasswordRequestQuery,
	SendPasswordResetEmailQuery,
	SignUpRequestBody,
} from '../types/index.js';
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
		if (err instanceof DatabaseError && err.message === 'does_not_exist') {
			return reply.status(httpStatus.UNAUTHORIZED).send('Invalid credentials');
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
					.replace(/[^a-zA-Z0-9\s]/g, '')
					.substring(0, 9)}${getRandomNumber(0, 10000)}`,
			password_hash: hash,
			salt,
			role: authRoles.USER,
			is_banned: false,
			reset_password_token: '',
			createdAt: Date.now(),
		});

		await userService.updateUserById(user.id, {
			reset_password_token: jwt.sign(
				{ sub: user.id, iat: Date.now() },
				env.JWT_REFRESH_TOKEN_SECRET,
			),
		});

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
		if (err instanceof DatabaseError && err.message === 'already_exists') {
			return reply
				.status(httpStatus.CONFLICT)
				.send('User with this email already exists');
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
		if (err instanceof DatabaseError && err.message === 'does_not_exist') {
			return reply.status(httpStatus.UNAUTHORIZED).send('User does not exist');
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

export const getResetPassword: RouteHandler<{
	Querystring: GetResetPasswordRequestQuery;
}> = async (request, reply) => {
	const { token } = request.query;
	try {
		const { sub } = jwt.verify(
			token,
			env.JWT_REFRESH_TOKEN_SECRET,
		) as jwt.JwtPayload;
		const user = await userService.getUser({ id: sub });
		if (user.reset_password_token !== token) {
			return reply
				.status(httpStatus.GONE)
				.send('Link has expired / is invalid');
		}
		return reply.view('reset-password', { token });
	} catch (err) {
		if (err instanceof DatabaseError && err.message == 'does_not_exist') {
			return reply.status(httpStatus.NOT_FOUND).send('User does not exist');
		}
		if (err instanceof jwt.JsonWebTokenError) {
			return reply.status(httpStatus.UNAUTHORIZED).send('Invalid token');
		}
		reply.log.error(err);
		return reply
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.send(err instanceof Error && err.message);
	}
};

export const postResetPassword: RouteHandler<{
	Body: PostResetPasswordRequestBody;
	Querystring: PostResetPasswordRequestQuery;
}> = async (request, reply) => {
	const { newPassword } = request.body;
	const { token } = request.query;
	try {
		const { sub } = jwt.verify(
			token,
			env.JWT_REFRESH_TOKEN_SECRET,
		) as jwt.JwtPayload;
		const user = await userService.getUser({ id: sub });
		if (user.reset_password_token !== token) {
			return reply
				.status(httpStatus.GONE)
				.send('Link has expired / is invalid');
		}
		const { hash, salt } = getHashAndSalt(newPassword);
		await userService.updateUserById(sub as string, {
			password_hash: hash,
			salt,
			reset_password_token: jwt.sign(
				{ sub: user.id, iat: Date.now() },
				env.JWT_REFRESH_TOKEN_SECRET,
			),
		});
		return reply.view('reset-password-success');
	} catch (err) {
		if (err instanceof DatabaseError && err.message == 'does_not_exist') {
			return reply.status(httpStatus.NOT_FOUND).send('User does not exist');
		}
		if (err instanceof jwt.JsonWebTokenError) {
			return reply.status(httpStatus.UNAUTHORIZED).send('Invalid token');
		}
		reply.log.error(err);
		return reply
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.send(err instanceof Error && err.message);
	}
};

export const sendPasswordResetEmail: RouteHandler<{
	Querystring: SendPasswordResetEmailQuery;
}> = async (request, reply) => {
	const { email } = request.query;
	try {
		await userService.getUser({ email });
		await authService.sendPasswordResetEmail(email);
		return reply.status(httpStatus.OK).send();
	} catch (err) {
		if (err instanceof DatabaseError && err.message == 'does_not_exist') {
			return reply.status(httpStatus.NOT_FOUND).send('User does not exist');
		}
		reply.log.error(err);
		return reply
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.send(err instanceof Error && err.message);
	}
};

export const googleLogin: RouteHandler = async (request, reply) => {
	return reply.redirect(httpStatus.TEMPORARY_REDIRECT, 'https://google.com');
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
