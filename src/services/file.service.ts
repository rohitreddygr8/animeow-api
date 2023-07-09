import aws from 'aws-sdk';

import { env } from '../constants/index.js';

const region = 'ap-south-1';

const s3 = new aws.S3({
	region,
	credentials: {
		accessKeyId: env.S3_ACCESS_KEY_ID,
		secretAccessKey: env.S3_ACCESS_KEY_SECRET,
	},
});

export const uploadFileToBucket = async ({
	key,
	body,
	bucket,
}: {
	key: string;
	body: aws.S3.Body;
	bucket: string;
}) => {
	await s3.putObject({ Bucket: bucket, Key: key, Body: body }).promise();
	return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

export const deleteFileFromBucket = async ({
	key,
	bucket,
}: {
	key: string;
	bucket: string;
}) => await s3.deleteObject({ Bucket: bucket, Key: key }).promise();

export const uploadImageToBucket = async ({
	key,
	body,
}: {
	key: string;
	body: aws.S3.Body;
}) =>
	await uploadFileToBucket({
		key: `images/${key}`,
		body,
		bucket: env.S3_BUCKET_NAME,
	});

export const deleteImageFromBucket = async ({
	key,
	bucket,
}: {
	key: string;
	bucket: string;
}) => await deleteFileFromBucket({ key: `images/${key}`, bucket });
