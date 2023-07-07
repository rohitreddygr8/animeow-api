import { z } from 'zod';

const passwordRegex =
	/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})\S+$/;

export const logInRequestSchema = z.object({
	body: z.object({
		email: z.string().nonempty(),
		password: z.string().nonempty(),
	}),
});

export const signUpRequestSchema = z.object({
	body: z.object({
		email: z.string().nonempty().email(),
		username: z.string().nonempty().nullish(),
		password: z
			.string()
			.nonempty()
			.regex(
				passwordRegex,
				'Password should contain at least 1 uppercase letter, 1 lowercase letter, 1 special character and should be 8 or more characters in length',
			),
	}),
});

export const refreshTokenRequestSchema = z.object({
	cookies: z.object({
		refreshToken: z.string().nonempty(),
	}),
});

export const getResetPasswordRequestSchema = z.object({
	query: z.object({
		token: z.string().nonempty(),
	}),
});

export const postResetPasswordRequestSchema = z.object({
	body: z
		.object({
			newPassword: z
				.string()
				.nonempty()
				.regex(
					passwordRegex,
					'Password should contain at least 1 uppercase letter, 1 lowercase letter, 1 special character and should be 8 or more characters in length',
				),
			confirmNewPassword: z.string().nonempty(),
		})
		.refine(
			(val) => val.newPassword === val.confirmNewPassword,
			'New password and confirm password do not match',
		),

	query: z.object({
		token: z.string().nonempty(),
	}),
});

export const sendPasswordResetEmailSchema = z.object({
	query: z.object({
		email: z.string().nonempty().email(),
	}),
});
