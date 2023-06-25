import dotEnv from 'dotenv';
import z from 'zod';

dotEnv.config();

const envSchema = z
	.object({
		HOST: z.string().nonempty(),
		PORT: z
			.string()
			.nonempty()
			.transform((val) => parseInt(val)),
		NODE_ENV: z.union([z.literal('development'), z.literal('production')]),
		MAX_REQUESTS_PER_MINUTE: z
			.string()
			.nonempty()
			.transform((val) => parseInt(val)),
		DB_CONNECTION_STRING: z.string().nonempty(),
		JWT_ACCESS_TOKEN_SECRET: z.string().nonempty(),
		JWT_REFRESH_TOKEN_SECRET: z.string().nonempty(),
		ORIGIN_URL: z.string().nonempty(),
	})
	.transform((val) => ({
		...val,
		IS_DEV: process.env.NODE_ENV !== 'production',
		LOGS_ENABLED: process.env.LOGS_ENABLED !== 'false',
	}));

const envVariables: Partial<Record<keyof z.infer<typeof envSchema>, unknown>> =
	{
		HOST: process.env.HOST,
		PORT: process.env.PORT,
		NODE_ENV: process.env.NODE_ENV,
		MAX_REQUESTS_PER_MINUTE: process.env.MAX_REQUESTS_PER_MINUTE,
		LOGS_ENABLED: process.env.LOGS_ENABLED,
		DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING,
		JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET,
		JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET,
		ORIGIN_URL: process.env.ORIGIN_URL,
	};

export const env = envSchema.parse(envVariables);
