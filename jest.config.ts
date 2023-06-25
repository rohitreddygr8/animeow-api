import { Config } from 'jest';

const config: Config = {
	setupFiles: ['./src/tests/unit/set-up.ts'],
	testEnvironment: 'node',
};

export default config;
