'use strict';
// # Authors Helper
// Usage: `{{authors}}`, `{{authors separator=' - '}}`
//
// Returns a string of the authors on the post.
// By default, authors are separated by commas.
//
// Note that the standard {{#each authors}} implementation is unaffected by this helper.
import type { HelperOptions } from 'handlebars';
import { Handlebars } from 'workers-hbs';
import visible from '../utils/visible';
import { getMetadataUrl } from '../utils/urls';
import { WorkersCompatGhost } from '..';

export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper('authors', function (this: any, options: HelperOptions) {
		let {
			autolink,
			separator = ', ',
			prefix = '',
			suffix = '',
			limit,
			visibility = 'public',
			from = 1,
			to,
		} = options.hash || {};
		const authors = visible(this.authors || [], visibility);

		if (!authors.length) {
			return '';
		}

		autolink = !(typeof autolink === 'string' && autolink === 'false');
		limit = limit ? parseInt(limit, 10) : limit;
		from = from ? parseInt(from, 10) : from;
		to = to ? parseInt(to, 10) : to;

		from -= 1; // From uses 1-indexed, but array uses 0-indexed.
		to = to || limit + from || authors.length;

		const output = authors
			.map((author: any) => {
				return autolink
					? `<a href="${getMetadataUrl(author)}">${Handlebars.escapeExpression(author.name)}</a>`
					: Handlebars.escapeExpression(author.name);
			})
			.slice(from, to)
			.join(separator);

		return new Handlebars.SafeString(prefix + output + suffix);
	});
}
