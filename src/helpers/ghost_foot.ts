// # Ghost Foot Helper
// Usage: `{{ghost_foot}}`
//

import type { HelperOptions } from 'handlebars';
import { Handlebars } from 'workers-hbs';
import { site as siteConfig } from '../config/site';
import isEmpty from '../utils/is_empty';
import { WorkersCompatGhost } from '..';

// Outputs scripts and other assets at the bottom of a Ghost theme

// We use the name ghost_foot to match the helper for consistency:
export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper('ghost_foot', function (options: HelperOptions) {
		const foot = [];

		const globalCodeinjection = siteConfig('codeinjection_foot');
		const postCodeinjection =
			options.data.root && options.data.root.post
				? options.data.root.post.codeinjection_foot
				: null;
		const tagCodeinjection =
			options.data.root && options.data.root.tag ? options.data.root.tag.codeinjection_foot : null;

		if (!isEmpty(globalCodeinjection)) {
			foot.push(globalCodeinjection);
		}

		if (!isEmpty(postCodeinjection)) {
			foot.push(postCodeinjection);
		}

		if (!isEmpty(tagCodeinjection)) {
			foot.push(tagCodeinjection);
		}

		return new Handlebars.SafeString(foot.join(' ').trim());
	});
}
