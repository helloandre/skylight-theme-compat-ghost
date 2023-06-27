// # Has Helper
// Usage: `{{#has tag="video, music"}}`, `{{#has author="sam, pat"}}`
//        `{{#has author="count:1"}}`, `{{#has tag="count:>1"}}`
//
// Checks if a post has a particular property

import { get, isEmpty, isFinite } from 'lodash-es';
import type { HelperOptions } from 'handlebars';
import { WorkersCompatGhost } from '..';

const validAttrs = ['tag', 'author', 'slug', 'visibility', 'id', 'number', 'index', 'any', 'all'];

const messages = {
	invalidAttribute: 'Invalid or no attribute given to has helper',
};

function handleCount(ctxAttr: string, data: any) {
	if (!data || !isFinite(data.length)) {
		return false;
	}
	let count;

	// @TODO optimize
	if (ctxAttr.match(/count:\d+/)) {
		// @ts-ignore
		count = Number(ctxAttr.match(/count:(\d+)/)[1]);
		return count === data.length;
	} else if (ctxAttr.match(/count:>\d/)) {
		// @ts-ignore
		count = Number(ctxAttr.match(/count:>(\d+)/)[1]);
		return count < data.length;
	} else if (ctxAttr.match(/count:<\d/)) {
		// @ts-ignore
		count = Number(ctxAttr.match(/count:<(\d+)/)[1]);
		return count > data.length;
	}

	return false;
}

function evaluateTagList(expr: string, tags: string[]) {
	return expr
		.split(',')
		.map(v => v.trim())
		.reduce((p, c) => {
			return (
				p ||
				tags.findIndex(item => {
					// Escape regex special characters
					item = item.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
					return new RegExp('^' + item + '$', 'i').test(c);
				}) !== -1
			);
		}, false);
}

function handleTag(data: any, attrs: any) {
	if (!attrs.tag) {
		return false;
	}

	if (attrs.tag.match(/count:/)) {
		return handleCount(attrs.tag, data.tags);
	}

	return (
		evaluateTagList(
			attrs.tag,
			data.tag.map(({ name }: { name: string }) => name)
		) || false
	);
}

function evaluateAuthorList(expr: string, authors: any) {
	const authorList = expr.split(',').map(v => v.trim().toLocaleLowerCase());

	return authors.filter((author: any) => authorList.includes(author.name.toLocaleLowerCase()))
		.length;
}

function handleAuthor(data: any, attrs: any) {
	if (!attrs.author) {
		return false;
	}

	if (attrs.author.match(/count:/)) {
		return handleCount(attrs.author, data.authors);
	}

	return evaluateAuthorList(attrs.author, data.authors) || false;
}

function evaluateIntegerMatch(expr: string, integer: number) {
	const nthMatch = expr.match(/^nth:(\d+)/);
	if (nthMatch) {
		return integer % parseInt(nthMatch[1], 10) === 0;
	}

	return expr
		.split(',')
		.reduce((bool, _integer) => bool || parseInt(_integer, 10) === integer, false);
}

function evaluateStringMatch(expr: string, str: string, ci: boolean) {
	if (ci) {
		return expr && str && expr.toLocaleLowerCase() === str.toLocaleLowerCase();
	}

	return expr === str;
}

/**
 *
 * @param {String} type - either some or every - the lodash function to use
 * @param {String} expr - the attribute value passed into {{#has}}
 * @param {Object} obj - "this" context from the helper
 * @param {Object} data - global params
 */
function evaluateList(type: 'some' | 'every', expr: string, obj: any, data: any) {
	return expr
		.split(',')
		.map(prop => prop.trim().toLocaleLowerCase())
		[type](prop => {
			if (prop.match(/^@/)) {
				return (
					data.hasOwnProperty(prop.replace(/@/, '')) && !isEmpty(get(data, prop.replace(/@/, '')))
				);
			} else {
				return obj.hasOwnProperty(prop) && !isEmpty(get(obj, prop));
			}
		});
}

export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper('has', function (this: any, options: HelperOptions) {
		const attrs = validAttrs.filter(attr => options.hash?.hasOwnProperty(attr));

		const checks: { [idx: string]: () => boolean } = {
			tag: () => handleTag(this, attrs),
			author: () => handleAuthor(this, attrs),
			number: () =>
				(options.hash?.number && evaluateIntegerMatch(options.hash?.number, options.data.number)) ||
				false,
			index: () =>
				(options.hash?.index && evaluateIntegerMatch(options.hash?.index, options.data.index)) ||
				false,
			visibility: () =>
				(options.hash?.visibility &&
					evaluateStringMatch(options.hash?.visibility, this.visibility, true)) ||
				false,
			slug: () =>
				(options.hash?.slug && evaluateStringMatch(options.hash?.slug, this.slug, true)) || false,
			id: () => (options.hash?.id && evaluateStringMatch(options.hash?.id, this.id, true)) || false,
			any: () =>
				(options.hash?.any && evaluateList('some', options.hash?.any, this, options.data)) || false,
			all: () =>
				(options.hash?.all && evaluateList('every', options.hash?.all, this, options.data)) ||
				false,
		};

		if (isEmpty(attrs)) {
			throw new Error(messages.invalidAttribute);
		}

		const result = attrs.some(attr => checks[attr]());
		return result ? options.fn(undefined) : options.inverse(undefined);
	});
}
