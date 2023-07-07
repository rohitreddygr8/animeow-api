import crypto from 'node:crypto';

export const getRandomHexString = () => crypto.randomBytes(64).toString('hex');
