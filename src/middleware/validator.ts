import { NextFunction, Request, Response } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import logger from '../utils/logger';
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema';

/**
 * Validates incoming requests' query and body params using `express-validator`
 * @param {e.Request} req - The request object
 * @param {e.Response} res - The response object
 * @param {e.NextFunction} next - The next function
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	return next();
};

/***
 * Validates incoming requests' query and body params using `express-validator`
 * @param validations
 */
export const validate = (
	validations: RunnableValidationChains<ValidationChain> | RunnableValidationChains<ValidationChain>[]
) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		await Promise.all(validations.map((validation) => validation.run(req)));

		// run validation
		const errors = validationResult(req);

		// pass to next function if no errors
		if (errors.isEmpty()) {
			return next();
		}

		logger.warn('params validation failed', errors.array());

		// return 400 with erroneous data otherwise
		return res.status(400).json({
			errors: errors.array(),
		});
	};
};
