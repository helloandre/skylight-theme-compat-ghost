// # Post Class Helper
// Usage: `{{post_class}}`
//
// Output classes for the body element
import { Handlebars } from 'workers-hbs';
import type { WorkersCompatGhost } from '..';

// We use the name post_class to match the helper for consistency:
export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper('post_class', function (this: any) {
		// eslint-disable-line camelcase
		let classes = ['post'];

		const tags = this.post && this.post.tags ? this.post.tags : this.tags || [];
		const featured = this.post && this.post.featured ? this.post.featured : this.featured || false;
		const image =
			this.post && this.post.feature_image ? this.post.feature_image : this.feature_image || false;
		const page = this.post && this.post.page ? this.post.page : this.page || false;

		if (tags) {
			classes = classes.concat(tags.map((t: any) => `tag-${t.slug}`));
		}

		if (featured) {
			classes.push('featured');
		}

		if (!image) {
			classes.push('no-image');
		}

		if (page) {
			classes.push('page');
		}

		return new Handlebars.SafeString(classes.join(' ').trim());
	});
}
