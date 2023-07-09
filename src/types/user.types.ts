import { z } from 'zod';

import { userValidation } from '../validations/index.js';
import { AuthRole } from './auth.types.js';

export type GetUsersRequestQuery = z.infer<
	typeof userValidation.getUsersRequestSchema
>['query'];

export type DeleteAccountRequestBody = z.infer<
	typeof userValidation.deleteAccountRequestSchema
>['body'];

export interface User {
	email: string;
	password_hash: string;
	salt: string;
	username: string;
	role: AuthRole;
	is_banned: boolean;
	reset_password_token: string;
	image_url?: string;
	createdAt: number;
}

export interface UserWithId extends User {
	id: string;
}
