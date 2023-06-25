import { User } from '../types/index.js';
import { mongoClient } from './connect-to-db.js';

export const db = mongoClient.db('animeow');

export const Users = db.collection<User>('users');
