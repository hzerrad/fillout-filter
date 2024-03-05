/***
 * Formats date to a specific locale/timezone
 * @param locale locale
 * @param timezone timezone
 */
export default function timestamp(
	locale: string,
	timezone: string = 'UTC'
): string {
	return new Date().toLocaleString(locale, {
		timeZone: timezone,
	});
}
