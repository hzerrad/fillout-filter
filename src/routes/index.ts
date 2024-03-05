import { Router } from 'express';
import filloutApi from '../utils/fillout-api';
import { FilterClauseType } from '../types/FilterClauseType';
import { FilterCondition } from '../types/FilterCondition';
import { validate } from '../middleware/validator';
import { checkSchema } from 'express-validator';
import { getFilteredSchema } from './validation';
import { SubmissionResponse } from '../types/SubmissionResponse';

const router = Router();

router.get('/:formId/filteredResponses', validate(checkSchema(getFilteredSchema)), async (req, res) => {
	const { formId } = req.params;
	const { status, beforeDate, afterDate, filter, sort, limit, offset, includeEditLink } = req.query;

	const filterClause = parseFilters(filter as string | string[]);

	const response = await filloutApi.get(`/v1/api/forms/${formId}/submissions`, {
		params: {
			status,
			beforeDate,
			afterDate,
			sort,
			// limit is not set to get the maximum number of responses and consequently calculate totalResponse and pageCount correctly
			includeEditLink,
		},
	});

	const data: SubmissionResponse = response.data;

	let filteredResponses;

	if (filterClause) {
		const filterIds = filterClause.map((f) => f.id);

		filteredResponses = data.responses.filter((response) => {
			// Check if the submission contains all the question IDs in the filter
			const containsAllIds = filterIds.every((filterId) =>
				response.questions.some((question) => question.id === filterId)
			);

			if (!containsAllIds) {
				return false; // Exclude submission if it doesn't contain all IDs
			}

			// Apply filter conditions
			return response.questions.every((question) => {
				const filter = filterClause.find((f) => f.id === question.id);
				if (!filter) {
					return true; // Include questions that are not part of the filter
				}

				switch (filter.condition) {
					case 'equals':
						return question.value?.toString().toLowerCase() === filter.value.toString().toLowerCase();
					case 'does_not_equal':
						return question.value !== filter.value;
					case 'greater_than':
						return new Date(question.value) > new Date(filter.value);
					case 'less_than':
						return new Date(question.value) < new Date(filter.value);
					default:
						return true;
				}
			});
		});
	} else {
		filteredResponses = data.responses; // No filter, include all responses
	}

	const pageLimit = parseInt((limit as string) ?? '150');
	const pageOffset = parseInt((offset as string) ?? '0');

	const totalResponses = filteredResponses.length;
	const pageCount = Math.ceil(totalResponses / pageLimit);

	const limitedResponses = filteredResponses.slice(pageOffset, pageOffset + pageLimit);

	res.status(200).send({
		responses: limitedResponses,
		totalResponses,
		pageCount,
	} satisfies SubmissionResponse);
});

/**
 * Parses the filter query parameter into an array of objects
 * @param {string | string[]} filter - The filter query parameter
 * @returns {FilterClauseType[]} - An array of filter objects
 */
function parseFilters(filter: string | string[]): FilterClauseType[] | null {
	if (!filter || !filter.length) {
		return null;
	}
	// filter is of format id,condition,value or array of id,condition,value
	// transform into array of objects
	const filters = Array.isArray(filter) ? filter : [filter];
	return filters.map((filter) => {
		const [id, condition, value] = filter.split(',');

		return {
			id: id,
			condition: condition as FilterCondition,
			value: value,
		};
	});
}

export default router;
