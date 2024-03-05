import { Router } from 'express';
import filloutApi from '../utils/fillout-api';
import { FilterClauseType } from '../types/FilterClauseType';
import { FilterCondition } from '../types/FilterCondition';
import { validate } from '../middleware/validator';
import { checkSchema } from 'express-validator';
import { getFilteredSchema } from './validation';

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
			limit,
			offset,
			includeEditLink,
		},
	});

	console.log('filterClause', filterClause);
	console.log('response', response.data);

	res.status(200).send(response.data);
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
