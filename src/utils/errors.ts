const databaseErrorCodes = ['already_exists', 'does_not_exist'] as const;

type DatabaseErrorCode = (typeof databaseErrorCodes)[number];

export class DatabaseError {
	message: DatabaseErrorCode;
	stack?: string;

	constructor(message: DatabaseErrorCode) {
		this.message = message;
		this.stack = new Error().stack;
	}
}
