// # Content Helper
// Usage: `{{content}}`, `{{content words="20"}}`, `{{content characters="256"}}`
//
// Turns content html into a safestring so that the user doesn't have to
// escape it or tell handlebars to leave it alone with a triple-brace.
//
// Shows default or custom CTA when trying to see content without access
//
// Enables tag-safe truncation of content by characters or words.
//
// Dev flag feature: In case of restricted content access for member-only posts, shows CTA box
import type { WorkersCompatGhost } from '..';
import { SafeString, HelperOptions } from 'handlebars';
import truncate from '../utils/truncate';

// function restrictedCta(options) {
// 	options = options || {};
// 	options.data = options.data || {};

// 	_.merge(this, {
// 		// @deprecated in Ghost 5.16.1 - not documented & removed from core templates
// 		accentColor: options.data.site && options.data.site.accent_color,
// 	});

// 	const data = createFrame(options.data);
// 	return templates.execute('content-cta', this, { data });
// }

export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper('content', function (this: any, options: HelperOptions) {
		if (this.html === null) {
			this.html = '';
		}

		// if (!_.isUndefined(this.access) && !this.access) {
		// 	return restrictedCta.apply(self, args);
		// }

		if (options.hash?.hasOwnProperty('words') || options.hash?.hasOwnProperty('characters')) {
			return new SafeString(truncate(this.html, options.hash || {}));
		}

		return new SafeString(this.html);
	});
}
