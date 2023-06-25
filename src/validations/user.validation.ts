import { z } from 'zod';

import { authRoles } from '../constants/index.js';

export const getUsersRequestSchema = z.object({
	query: z
		.object({
			_id: z.string().nonempty().optional(),
			email: z.string().nonempty().optional(),
			role: z
				.union([
					z.literal(authRoles.USER),
					z.literal(authRoles.STAFF),
					z.literal(authRoles.ADMIN),
				])
				.optional(),
			username: z.string().nonempty().optional(),
			is_banned: z.boolean().optional(),
			is_deactivated: z.boolean().optional(),
		})
		.optional(),
});

export const deleteAccountRequestSchema = z.object({
	body: z.object({
		userId: z.string().nonempty(),
	}),
});
