import { z } from 'zod';

import { authRoles } from '../constants/auth-roles.js';
import { authValidation } from '../validations/index.js';

export type AuthRole = (typeof authRoles)[keyof typeof authRoles];

export type LoginRequestBody = z.infer<
	typeof authValidation.logInRequestSchema
>['body'];

export type SignUpRequestBody = z.infer<
	typeof authValidation.signUpRequestSchema
>['body'];

export type RefreshTokenRequestCookies = z.infer<
	typeof authValidation.refreshTokenRequestSchema
>['cookies'];

export type GetResetPasswordRequestQuery = z.infer<
	typeof authValidation.getResetPasswordRequestSchema
>['query'];

export type PostResetPasswordRequestBody = z.infer<
	typeof authValidation.postResetPasswordRequestSchema
>['body'];

export type PostResetPasswordRequestQuery = z.infer<
	typeof authValidation.postResetPasswordRequestSchema
>['query'];

export type SendPasswordResetEmailQuery = z.infer<
	typeof authValidation.sendPasswordResetEmailSchema
>['query'];
