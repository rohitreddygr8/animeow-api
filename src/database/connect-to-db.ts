import chalk from 'chalk';
import { MongoClient } from 'mongodb';

import { env } from '../constants/index.js';

export const mongoClient = new MongoClient(env.DB_CONNECTION_STRING);

export const connectToDb = async () => {
	console.log(chalk.green.bold('>>> Connecting to database...'));
	try {
		await mongoClient.connect();
		console.log(chalk.green.bold('>>> Connected to database successfully ✅'));
	} catch (err) {
		console.log(chalk.red.bold('>>> Could not connect to database ❌'));
	}
};
