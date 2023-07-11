// # contentFor helper
// Usage: `{{#contentFor "block_name"}}some content{{/contentFor}}
import { HelperOptions } from 'handlebars';
import { WorkersCompatGhost } from '..';

// We use the name body_class to match the helper for consistency
export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper('contentFor', function (name: string, options: HelperOptions) {
		if (!options.data.root.blockCache) {
			options.data.root.blockCache = {};
		}
		if (!options.data.root.blockCache[name]) {
			options.data.root.blockCache[name] = [];
		}

		options.data.root.blockCache[name].push(options.fn(undefined));
	});
}
