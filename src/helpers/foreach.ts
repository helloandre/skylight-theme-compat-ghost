// # Foreach Helper
// Usage: `{{#foreach data}}{{/foreach}}`
//
// Block helper designed for looping through posts

import type { HelperOptions } from 'handlebars';
import { WorkersCompatGhost } from '..';
import visible from '../utils/visible';

const messages = {
	iteratorNeeded: 'Need to pass an iterator to {{#foreach}}',
};

function isPost(item: any) {
	return item.hasOwnProperty('html') && item.hasOwnProperty('title') && item.hasOwnProperty('slug');
}

export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper(
		'foreach',
		function (this: any, items: any = [], options: HelperOptions) {
			if (!options) {
				throw new Error(messages.iteratorNeeded);
			}

			if (typeof items === 'function') {
				items = items.call(this);
			}
			const isArr = Array.isArray(items);
			let visibility = options.hash.visibility;
			if (isArr && items.length > 0 && isPost(items[0])) {
				visibility = visibility || 'all';
			} else if (
				(typeof items === 'object' || typeof items === 'function') &&
				Array.isArray(Object.values(items))
			) {
				if (Object.values(items).length > 0 && isPost(Object.values(items)[0])) {
					visibility = visibility || 'all';
				}
			}
			// Exclude items which should not be visible in the theme
			items = visible(items, visibility || 'all');

			// Initial values set based on parameters sent through. If nothing sent, set to defaults
			const { fn, inverse, hash, data } = options;
			let { columns, limit, from, to } = hash;
			let length = isArr ? items.length : Object.keys(items).length;
			let output = '';
			let frame: any = {};
			let contextPath: null | string = null;

			limit = parseInt(limit, 10) || length;
			from = parseInt(from, 10) || 1;
			to = parseInt(to, 10) || length;

			// If a limit option was sent through (aka not equal to default (length))
			// and from plus limit is less than the length, set to to the from + limit
			if (limit < length && from + limit <= length) {
				to = from - 1 + limit;
			}

			if (data?.ids) {
				contextPath = [data.contextPath, data.ids[0]].join(',') + '.';
			}

			if (data) {
				frame = { ...data };
			}

			const execIteration = (field: string, index: number, last: boolean) => {
				if (frame) {
					frame.key = field;
					frame.index = index;
					frame.number = index + 1;
					frame.first = index === from - 1; // From uses 1-indexed, but array uses 0-indexed
					frame.last = !!last;
					frame.even = index % 2 === 1;
					frame.odd = !frame.even;
					frame.rowStart = index % columns === 0;
					frame.rowEnd = index % columns === columns - 1;
					if (contextPath) {
						frame.contextPath = contextPath + field;
					}
				}

				output =
					output +
					fn(items[field], {
						data: frame,
						blockParams: instance.hbs.hbs.Utils.blockParams(
							[items[field], field],
							[contextPath + field, null]
						),
					});
			};

			const iterateCollection = (context: any) => {
				// Context is all posts on the blog
				let current = 1;

				// For each post, if it is a post number that fits within the from and to
				// send the key to execIteration to set to be added to the page
				const keys = Array.isArray(context) ? context.keys() : Object.keys(context);
				for (const key of keys) {
					if (current < from) {
						current += 1;
						return;
					}

					if (current <= to) {
						execIteration(key.toString(), current - 1, current === to);
					}

					current += 1;
				}
			};

			if (items && typeof items === 'object') {
				iterateCollection(items);
			}

			if (length === 0) {
				output = inverse(this);
			}

			return output;
		}
	);
}
