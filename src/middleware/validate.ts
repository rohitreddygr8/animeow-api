import { preHandlerAsyncHookHandler } from 'fastify';
import httpStatus from 'http-status';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
	const fn: preHandlerAsyncHookHandler = async (request, reply) => {
		try {
			return await schema.parseAsync(request);
		} catch (error) {
			if (error instanceof ZodError) {
				return reply.status(httpStatus.UNPROCESSABLE_ENTITY).send(error.issues);
			}
			return reply.status(httpStatus.INTERNAL_SERVER_ERROR).send();
		}
	};

	return fn;
};
