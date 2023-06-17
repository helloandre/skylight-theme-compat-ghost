// # Get Helper
// Usage: `{{#get "posts" limit="5"}}`, `{{#get "tags" limit="all"}}`
// Fetches data from the API
import { WorkersCompatGhost } from '..';
import type { HelperOptions } from 'handlebars';

export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper('get', function (prop: string, options: HelperOptions) {
		console.log('get', { prop, options });
		return options.fn(undefined);
	});
}
