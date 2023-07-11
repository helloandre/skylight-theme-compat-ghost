// # Block helper
// Usage: `{{{block "inline_block_name"}}}`
// Usage: `{{#block "block_name"}}Default Content{{/block}}
import { HelperOptions } from 'handlebars';
import { getTemplateData } from '../utils/helper_data';
import { WorkersCompatGhost } from '..';

export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper('block', function (name: string, options: HelperOptions) {
		const val = (getTemplateData(options).blockCache || {})[name];
		if (val === undefined && typeof options.fn === 'function') {
			return options.fn(undefined);
		}

		return Array.isArray(val) ? val.join('\n') : val;
	});
}
