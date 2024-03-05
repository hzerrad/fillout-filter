/***
 * Default logging instance based on Winston
 */
import winston from 'winston';
import timestamp from './timestamp';

// Create instance
const logger = winston.createLogger();

// Init formatting
const format = winston.format;

// Change formatting according to deployment environment
const prettyConsoleFormat = format.printf(
	({level, message, service, timestamp}) => {
		return `${service} - [${level}]: ${message} (${timestamp})`;
	}
);

logger.configure({
	level: 'debug',
	defaultMeta: {service: 'fillout-api:server'},
	transports: [
		new winston.transports.Console({
			format: format.combine(
				format.colorize(),
				format.timestamp({
					format: timestamp('en-US'),
				}),
				prettyConsoleFormat
			),
		}),
	],
});

export default logger;
