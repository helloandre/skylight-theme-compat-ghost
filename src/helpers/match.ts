import { HelperOptions, SafeString } from 'handlebars';
import isEmpty from '../utils/is_empty';
import { WorkersCompatGhost } from '..';

const messages = {
	invalidAttribute: 'Invalid or no attribute given to match helper',
};

const handleConditional = (conditional: boolean | Function, options: HelperOptions) => {
	if (typeof conditional === 'function') {
		conditional = conditional.call(this);
	}

	// Default behavior is to render the positive path if the value is truthy and not empty.
	// The `includeZero` option may be set to treat the condtional as purely not empty based on the
	// behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
	if ((!options.hash.includeZero && !conditional) || isEmpty(conditional)) {
		return false;
	} else {
		return true;
	}
};

const handleMatch = (data: any, operator: string, value: any) => {
	let result;

	switch (operator) {
		case '!=':
			result = data !== value;
			break;
		case '<':
			result = data < value;
			break;
		case '>':
			result = data > value;
			break;
		case '>=':
			result = data >= value;
			break;
		case '<=':
			result = data <= value;
			break;
		default:
			result = data === value;
	}

	return result;
};

export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper('match', function (this: any, ...attrs: any[]) {
		const options = attrs.pop();
		const isBlock = options != null && options.hasOwnProperty('fn');
		let result;

		if (isEmpty(attrs)) {
			// logging.warn(tpl(messages.invalidAttribute));
			return;
		}

		// If any of the attributes are safe strings, change them back to their original value
		attrs = attrs.map(attr => {
			if (attr instanceof SafeString) {
				return attr.toString();
			}

			return attr;
		});

		if (attrs.length === 1) {
			// CASE: single attribute, treat it as simple true/false (like the if helper)
			result = handleConditional(attrs[0], options);
		} else if (attrs.length === 2) {
			// CASE: two attributes, assume the operator is "="
			result = handleMatch(attrs[0], '=', attrs[1]);
		} else if (attrs.length === 3) {
			// CASE: three attributes, handle the match exactly
			result = handleMatch(attrs[0], attrs[1], attrs[2]);
		} else {
			// logging.warn(tpl(messages.invalidAttribute));
			return;
		}

		// If we're in block mode, return the outcome from the fn/inverse functions
		if (isBlock) {
			if (result) {
				return options.fn();
			}

			return options.inverse();
		}

		// Else return the result as a SafeString Eg.{string: false} || {string: true}
		// @ts-ignore
		return new SafeString(result);
	});
}
