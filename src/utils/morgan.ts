/***
 * Morgan is a logging library for HTTP requests
 */
import morgan from 'morgan';
import timestamp from './timestamp';

// Set tokens
morgan.token('service', () => 'fillout-api:server');
morgan.token('timestamp', () => timestamp('en-US'));

/**
 * Create configured Morgan instance
 */
const morganMiddleware = morgan(
	':service - [:method] :url :status :res[content-type] :response-time ms (:timestamp)'
);

export default morganMiddleware;
