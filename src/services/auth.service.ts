import jwt from 'jsonwebtoken';

import { env } from '../constants/index.js';

export const getAccessTokenFromId = (userId: string): string =>
	jwt.sign({ sub: userId }, env.JWT_ACCESS_TOKEN_SECRET, {
		expiresIn: '15m',
	});

export const getRefreshTokenFromId = (userId: string): string =>
	jwt.sign({ sub: userId }, env.JWT_REFRESH_TOKEN_SECRET, {
		expiresIn: '15d',
	});
