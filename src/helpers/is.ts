// # Is Helper
// Usage: `{{#is "paged"}}`, `{{#is "index, paged"}}`
// Checks whether we're in a given context.
import type { HelperOptions } from 'handlebars';
import { WorkersCompatGhost } from '..';

const messages = {
	invalidAttribute: 'Invalid or no attribute given to is helper',
};

export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper('is', function (context: string, options: HelperOptions) {
		const currentContext = options.data.root.context;

		if (typeof context !== 'string') {
			// logging.warn(tpl(messages.invalidAttribute));
			return;
		}

		const anyInContext = context
			.split(',')
			.map(v => v.trim())
			.some(v => currentContext.includes(v));
		return anyInContext ? options.fn(undefined) : options.inverse(undefined);
	});
}
