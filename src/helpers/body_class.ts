// # Body Class Helper
// Usage: `{{body_class}}`
//
// Output classes for the body element
import { HelperOptions, SafeString } from 'handlebars';
import { getContext, getTemplateData } from '../utils/helper_data';
import { WorkersCompatGhost } from '..';

// We use the name body_class to match the helper for consistency
export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper('body_class', function (options: HelperOptions) {
		const context = getContext(options);
		const data = getTemplateData(options);
		const obj = data.post || data.page;
		const isPage = !!data.page;

		let classes = [];
		if (context.includes('home')) {
			classes.push('home-template');
		} else if (context.includes('post') && obj && !isPage) {
			classes.push('post-template');
		} else if (context.includes('page') && obj && isPage) {
			classes.push('page-template');
			classes.push(`page-${obj.slug}`);
		} else if (context.includes('tag') && data.tag) {
			classes.push('tag-template');
			classes.push(`tag-${data.tag.slug}`);
		} else if (context.includes('author') && data.author) {
			classes.push('author-template');
			classes.push(`author-${data.author.slug}`);
		} else if (context.includes('private')) {
			classes.push('private-template');
		}

		const tags = obj && obj.tags ? obj.tags : [];
		if (tags) {
			classes = classes.concat(tags.map(({ slug }: { slug: string }) => `tag-${slug}`));
		}

		if (context.includes('paged')) {
			classes.push('paged');
		}

		return new SafeString(classes.join(' ').trim());
	});
}
