import crypto from 'node:crypto';

export const getHashAndSalt = (text: string) => {
	const salt = crypto.randomBytes(64).toString('hex');
	const hash = crypto
		.pbkdf2Sync(text, salt, 100000, 64, 'sha256')
		.toString('hex');
	return { hash, salt };
};

export const getHash = (text: string, salt: string) => {
	const hash = crypto
		.pbkdf2Sync(text, salt, 100000, 64, 'sha256')
		.toString('hex');
	return hash;
};
