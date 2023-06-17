// # Excerpt Helper
// Usage: `{{excerpt}}`, `{{excerpt words="50"}}`, `{{excerpt characters="256"}}`
//
// Attempts to remove all HTML from the string, and then shortens the result according to the provided option.
//
// Defaults to words="50"

import { HelperOptions } from 'handlebars';
import { SafeString } from 'handlebars';
import isEmpty from '../utils/is_empty';
import { WorkersCompatGhost } from '..';
import truncate from '../utils/truncate';

export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper('excerpt', function (this: any, options: HelperOptions) {
		let excerptText;

		if (this.custom_excerpt) {
			excerptText = String(this.custom_excerpt);
		} else if (this.excerpt) {
			excerptText = String(this.excerpt);
		} else {
			excerptText = '';
		}

		if (!isEmpty(this.custom_excerpt)) {
			options.hash.characters = this.custom_excerpt.length;
		}

		return new SafeString(truncate(excerptText, options.hash));
	});
}
