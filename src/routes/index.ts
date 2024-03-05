import { Router } from 'express';
import { isAxiosError } from 'axios';
import { checkSchema } from 'express-validator';

import filloutApi from '../utils/fillout-api';
import logger from '../utils/logger';
import { getFilteredSchema } from './validation';
import { FilterClauseType } from '../types/FilterClauseType';
import { FilterCondition } from '../types/FilterCondition';
import { validate } from '../middleware/validator';
import { SubmissionResponse } from '../types/SubmissionResponse';

const router = Router();

router.get('/:formId/filteredResponses', validate(checkSchema(getFilteredSchema)), async (req, res) => {
	try {
		const { formId } = req.params;
		const { status, beforeDate, afterDate, filter, sort, limit, offset, includeEditLink } = req.query;

		// Parsing the filter clause from the query
		const filterClause = parseFilters(filter as string | string[]);

		// Fetching responses from the Fillout API without a limit to get the maximum number of responses
		const response = await filloutApi.get(`/v1/api/forms/${formId}/submissions`, {
			params: {
				status,
				beforeDate,
				afterDate,
				sort,
				// Omitting the limit/offset to fetch all available responses (helpful to correctly calculate pagination (total responses, page count))
				includeEditLink,
			},
		});

		const data: SubmissionResponse = response.data;

		let filteredResponses;

		if (!filterClause) {
			// Include all responses if no filter is applied
			filteredResponses = data.responses;
		} else {
			// Preparing a list of IDs from the filter clause for validation
			const filterIds = filterClause.map((f) => f.id);

			// Filtering the responses based on the filter criteria
			filteredResponses = data.responses.filter((response) => {
				// Ensuring each response contains all the question IDs specified in the filters
				const containsAllIds = filterIds.every((filterId) =>
					response.questions.some((question) => question.id === filterId)
				);

				if (!containsAllIds) {
					// Excluding the response if it doesn't contain all the required IDs
					return false;
				}

				// Applying the filter conditions to each question
				return response.questions.every((question) => {
					const filter = filterClause.find((f) => f.id === question.id);
					if (!filter) {
						// If the question is not part of the filter, include it by default
						return true;
					}

					// Matching the question's value with the filter's condition and value
					switch (filter.condition) {
						case 'equals':
							return question.value?.toString().toLowerCase() === filter.value.toString().toLowerCase();
						case 'does_not_equal':
							return question.value !== filter.value;
						case 'greater_than':
							return question.value > filter.value;
						case 'less_than':
							return question.value < filter.value;
						default:
							return true;
					}
				});
			});
		}

		// Calculating pagination parameters
		const pageLimit = parseInt((limit as string) ?? '150');
		const pageOffset = parseInt((offset as string) ?? '0');

		// Determining the total number of filtered responses and the number of pages
		const totalResponses = filteredResponses.length;
		const pageCount = Math.ceil(totalResponses / pageLimit);

		// Slicing the filtered responses based on the pagination parameters
		const limitedResponses = filteredResponses.slice(pageOffset, pageOffset + pageLimit);

		// Sending the paginated and filtered responses along with total response count and page count
		res.status(200).send({
			responses: limitedResponses,
			totalResponses,
			pageCount,
		} satisfies SubmissionResponse);
	} catch (e) {
		logger.error('Error fetching filtered responses', {
			error: (e as Error).message,
			stack: (e as Error).stack,
			response: isAxiosError(e) ? e.response?.data : undefined,
		});

		res.status(500).send({ error: 'Error fetching filtered responses' });
	}
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
