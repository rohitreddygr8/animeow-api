import { SiteSettingsCollection } from '../database/index.js';
import { DatabaseError } from '../utils/errors.js';

export const getIsStreamingEnabled = async () => {
	const data = await SiteSettingsCollection.findOne();
	if (!data) {
		throw new DatabaseError('does_not_exist');
	}
	return data.is_streaming_enabled;
};

export const setIsStreamingEnabled = async (value: boolean) => {
	await SiteSettingsCollection.updateOne({}, { is_streaming_enabled: value });
};
