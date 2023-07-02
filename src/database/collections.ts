import { SiteSettings, User } from '../types/index.js';
import { mongoClient } from './connect-to-db.js';

export const db = mongoClient.db('animeow');

export const Users = db.collection<User>('users');

export const SiteSettingsCollection =
	db.collection<SiteSettings>('site_settings');
