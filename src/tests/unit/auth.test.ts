import httpStatus from 'http-status';

import { app } from '../../app.js';

describe('/auth', () => {
	describe('/log-in', () => {
		it('should log in because request body follows schema', async () => {
			const res = await app
				.inject()
				.post('/v1/auth/log-in')
				.body({ username: 'username', password: 'Password123#' });
			expect(res.statusCode).toBe(httpStatus.OK);
		});

		it('should not log in request body does not follow schema', async () => {
			const res = await app
				.inject()
				.post('/v1/auth/log-in')
				.body({ username: 'username' });
			expect(res.statusCode).not.toBe(httpStatus.OK);
		});
	});

	describe('/sign-up', () => {
		it('should sign up because request body follows schema', async () => {
			const res = await app.inject().post('/v1/auth/sign-up').body({
				email: 'username@test.com',
				username: 'username',
				password: 'Password123#',
			});
			expect(res.statusCode).toBe(httpStatus.OK);
		});

		it('should not sign up because request body does not follow schema', async () => {
			const res = await app.inject().post('/v1/auth/sign-up').body({
				email: 'username@test.com',
				password: 'password12345',
			});
			expect(res.statusCode).not.toBe(httpStatus.OK);
		});
	});
});
