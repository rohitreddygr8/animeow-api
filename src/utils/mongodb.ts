import { ObjectId, WithId } from 'mongodb';

export const _IdToId = <T>(obj: WithId<T>) => {
	const { _id, ...rest } = obj;
	return { ...rest, id: _id.toString() };
};

export const IdTo_Id = <T>(
	obj: Omit<WithId<T>, '_id'> & {
		id: string;
	},
) => {
	const { id, ...rest } = obj;
	return { ...rest, _id: new ObjectId(id) };
};
