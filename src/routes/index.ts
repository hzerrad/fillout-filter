import { Router } from 'express';
import filloutApi from '../utils/fillout-api';

const router = Router();

router.get('/:formId/filteredResponses', async (req, res) => {
	const { formId } = req.params;
	const { status, beforeDate, afterDate, filter, sort, limit, offset } = req.query;

	const response = await filloutApi.get(`/v1/api/forms/${formId}/submissions`, {
		params: {
			status,
			beforeDate,
			afterDate,
			sort,
			limit,
			offset,
		},
	});

	console.log('filter', filter);

	res.status(200).send(response.data);
});

export default router;
