module.exports = {
	apps: [
		{
			name: `server`,
			script: './dist/server.js',
			instances: 4,
			max_restarts: 10,
			restart_delay: 5000,
			max_memory_restart: '256M',
			env: {
				NODE_ENV: 'development',
			},
			env_production: {
				NODE_ENV: 'production',
			},
		},
	],
};
