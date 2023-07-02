import 'fastify';

import { UserWithId } from './user.types.js';

declare module 'fastify' {
	export interface FastifyRequest {
		user: UserWithId;
	}
}
