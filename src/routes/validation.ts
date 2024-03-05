import { Schema } from 'express-validator';
import { filterConditions } from '../types/FilterCondition';

export const getFilteredSchema: Schema = {
	formId: {
		in: 'params',
		exists: {
			errorMessage: 'Missing formId',
		},
		isString: {
			errorMessage: 'invalid formId',
		},
	},

	status: {
		in: 'query',
		optional: true,
		exists: {
			errorMessage: 'Missing status',
		},
		custom: {
			options: (input: string) => {
				// reject if input is not a string
				if (['in_progress', 'finished'].includes(input)) {
					return Promise.resolve(input);
				}

				return Promise.reject(`Invalid status: ${input}`);
			},
		},
	},

	sort: {
		in: 'query',
		optional: true,
		exists: {
			errorMessage: 'Missing sort',
		},
		custom: {
			options: (input: string) => {
				if (input === 'asc' || input === 'desc') {
					return Promise.resolve(input);
				}

				return Promise.reject(`Invalid sort criteria: ${input}`);
			},
		},
	},

	beforeDate: {
		in: 'query',
		optional: true,
		isISO8601: {
			errorMessage: 'Invalid beforeDate',
		},
	},

	afterDate: {
		in: 'query',
		optional: true,
		isISO8601: {
			errorMessage: 'Invalid afterDate',
		},
	},

	includeEditLink: {
		in: 'query',
		optional: true,
		isBoolean: {
			errorMessage: 'invalid includeEditLink format',
		},
	},

	limit: {
		in: 'query',
		optional: true,
		isInt: {
			errorMessage: 'invalid limit format',
			options: { min: 1 },
		},
	},

	offset: {
		in: 'query',
		optional: true,
		isInt: {
			errorMessage: 'invalid offset format',
			options: { min: 0 },
		},
	},

	filter: {
		in: 'query',
		optional: true,
		custom: {
			options: (input: string | string[]) => {
				// make into an array if it's not already
				const filters = Array.isArray(input) ? input : [input];

				// check if each filter is in the correct format
				for (const filter of filters) {
					const split = filter.split(',');

					if (split.length !== 3) {
						return Promise.reject('Invalid filter');
					}

					const [id, condition, value] = split;
					if (!id || !condition || !value) {
						return Promise.reject('Invalid filter');
					}

					if (!filterConditions.includes(condition as never)) {
						return Promise.reject(`Invalid condition: ${condition}`);
					}
				}

				return Promise.resolve(input);
			},
		},
	},
};
