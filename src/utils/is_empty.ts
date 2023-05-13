/**
 * This is identical to the built-in if helper, except inverse/fn calls are replaced with false/true
 * https://github.com/handlebars-lang/handlebars.js/blob/19bdace85a8d0bc5ed3a4dec4071cb08c8d003f2/lib/handlebars/helpers/if.js#L9-L20
 */
export default function isEmpty(value: any) {
	if (!value && value !== 0) {
		return true;
	} else if (Array.isArray(value) && value.length === 0) {
		return true;
	} else {
		return false;
	}
}
