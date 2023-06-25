import { z } from 'zod';

export const logInRequestSchema = z.object({
	body: z.object({
		email: z.string().nonempty(),
		password: z.string().nonempty(),
	}),
});

export const signUpRequestSchema = z.object({
	body: z.object({
		email: z.string().nonempty().email(),
		username: z.string().nonempty().optional(),
		password: z
			.string()
			.nonempty()
			.regex(
				/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})\S+$/,
				'Password should contain at least 1 uppercase letter, 1 lowercase letter, 1 special character and should be 8 or more characters in length',
			),
	}),
});

export const refreshTokenRequestSchema = z.object({
	cookies: z.object({
		refreshToken: z.string().nonempty(),
	}),
});
