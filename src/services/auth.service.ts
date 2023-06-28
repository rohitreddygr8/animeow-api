import jwt from 'jsonwebtoken';

import { env } from '../constants/index.js';
import { AuthRole } from '../types/index.js';

export const getAccessToken = ({
	userId,
	role,
}: {
	userId: string;
	role: AuthRole;
}): string =>
	jwt.sign({ sub: userId, role }, env.JWT_ACCESS_TOKEN_SECRET, {
		expiresIn: '10m',
	});

export const getRefreshToken = ({
	userId,
	role,
}: {
	userId: string;
	role: AuthRole;
}): string =>
	jwt.sign({ sub: userId, role }, env.JWT_REFRESH_TOKEN_SECRET, {
		expiresIn: '10d',
	});
