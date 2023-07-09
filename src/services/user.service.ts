import { MultipartFile } from '@fastify/multipart';
import { ObjectId } from 'mongodb';

import { Users } from '../database/index.js';
import { User, UserWithId } from '../types/index.js';
import { _IdToId, DatabaseError } from '../utils/index.js';
import * as fileService from './file.service.js';

export const getUsers = async (
	filter: Partial<User>,
): Promise<UserWithId[]> => {
	const users = Users.find({ ...filter });
	const res = (await users.toArray()).map((val) => _IdToId(val));
	return res;
};

export const getUser = async (
	filter: Partial<UserWithId>,
): Promise<UserWithId> => {
	const user = await Users.findOne(
		filter.id ? { _id: new ObjectId(filter.id) } : filter,
	);
	if (!user) {
		throw new DatabaseError('does_not_exist');
	}
	return _IdToId(user);
};

export const createUser = async (userInfo: User): Promise<UserWithId> => {
	if (await Users.findOne({ email: userInfo.email })) {
		throw new DatabaseError('already_exists');
	}
	const { insertedId } = await Users.insertOne(userInfo);
	const user = await Users.findOne({ _id: insertedId });
	if (!user) {
		throw new DatabaseError('does_not_exist');
	}
	return _IdToId(user);
};

export const deleteUser = async (
	userInfo: Partial<UserWithId>,
): Promise<User> => {
	const { value } = await Users.findOneAndDelete({
		...userInfo,
		_id: new ObjectId(userInfo.id),
	});
	if (!value) {
		throw new DatabaseError('does_not_exist');
	}
	return _IdToId(value);
};

export const updateUserById = async (id: string, payload: Partial<User>) => {
	await Users.updateOne({ _id: new ObjectId(id) }, { $set: payload });
};

export const updateUserProfilePicture = async (
	imageFile: MultipartFile,
	userId: string,
) => {
	return await fileService.uploadImageToBucket({
		key: `${userId}.${imageFile.filename.split('.').at(-1)}`,
		body: await imageFile.toBuffer(),
	});
};
