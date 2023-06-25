import path from 'node:path';

import acceptsPlugin from '@fastify/accepts';
import cookiePlugin from '@fastify/cookie';
import corsPlugin from '@fastify/cors';
import eTagPlugin from '@fastify/etag';
import formBodyPlugin from '@fastify/formbody';
import helmetPlugin from '@fastify/helmet';
import multipartPlugin from '@fastify/multipart';
import rateLimitPlugin from '@fastify/rate-limit';
import staticPlugin from '@fastify/static';
import viewPlugin from '@fastify/view';
import webSocketsPlugin from '@fastify/websocket';
import chalk from 'chalk';
import { fastify, FastifyPluginAsync } from 'fastify';
import handlebars from 'handlebars';

import { env } from './constants/index.js';
import { connectToDb } from './database/index.js';
import { animeRouterPlugin, authRouterPlugin } from './routes/v1/index.js';
import { userRouterPlugin } from './routes/v1/user.route.js';

export const app = fastify({
	logger: env.LOGS_ENABLED && {
		transport: {
			target: 'pino-pretty',
			options: {
				translateTime: 'HH:MM:ss Z',
				destination: env.IS_DEV ? false : './server.log',
			},
		},
	},
});

const v1Plugin: FastifyPluginAsync = async (app) => {
	await app.register(animeRouterPlugin, { prefix: '/' });
	await app.register(authRouterPlugin, { prefix: '/auth' });
	await app.register(userRouterPlugin, { prefix: '/users' });
};

await app.register(rateLimitPlugin, {
	max: env.MAX_REQUESTS_PER_MINUTE,
	ban: 5,
});

await app.register(staticPlugin, {
	root: path.resolve('./public'),
	prefix: '/public',
});

await app.register(webSocketsPlugin, {
	connectionOptions: { encoding: 'utf-8' },
});

await app.register(viewPlugin, {
	engine: { handlebars },
	root: path.resolve('./src/views'),
	viewExt: 'handlebars',
	defaultContext: {
		dev: env.IS_DEV,
	},
});

await app.register(helmetPlugin);

await app.register(corsPlugin, {
	origin: env.IS_DEV
		? ['http://localhost:3000', 'http://localhost:4173']
		: env.ORIGIN_URL,
	credentials: true,
});

await app.register(cookiePlugin);

await app.register(acceptsPlugin);

await app.register(eTagPlugin);

await app.register(formBodyPlugin);

await app.register(multipartPlugin);

await app.register(v1Plugin, { prefix: '/v1' });

app.decorateRequest('user', null);

app.get('/', (_, reply) => {
	return reply.view('home');
});

export const startServer = async () => {
	try {
		console.log('\n');
		console.log(
			`${chalk.white.bold('<-- environment variables in')} ${chalk.magenta.bold(
				env.NODE_ENV.toLocaleUpperCase(),
			)} ${chalk.white.bold('environment -->')}`,
		);
		console.table(
			Object.entries(env).map(([key, value]) => ({
				KEY: key,
				VALUE: value,
			})),
		);
		console.log(`\n${chalk.green.bold('>>> Starting server...')}`);
		await connectToDb();
		await app.listen({ host: env.HOST, port: env.PORT });
		console.log(chalk.green.bold('>>> Started server successfully ✅'));
		console.log('\n');
	} catch (err) {
		console.error(err);
		console.log(`${chalk.red.bold('Stopping server... ❌')}`);
		await app.close();
	}
};
