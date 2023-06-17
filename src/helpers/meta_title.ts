import { HelperOptions } from 'handlebars';
import { getContext, getTemplateData } from '../utils/helper_data';
import { site } from '../config/site';
import { WorkersCompatGhost } from '..';

const optionalString = (test: string, str: string) => (test ? str : '');

export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper('meta_title', function (options: HelperOptions) {
		const data = getTemplateData(options);
		const context = getContext(options);
		const siteTitle = site('title') || '';
		const pagination = data ? data.pagination : null;

		// options.property = null/'og'/'twitter'
		// @ts-ignore
		const optionsPropertyName = `${options.property || 'meta'}_title`;

		let title = '';
		let pageString = '';

		if (pagination && pagination.total > 1) {
			pageString = options.hash.hasOwnProperty('page')
				? options.hash.page.replace('%', pagination.page)
				: ' (Page ' + pagination.page + ')';
		}

		const dashSiteTitle = optionalString(siteTitle, ' - ' + siteTitle);
		const dashSiteTitlePage = optionalString(
			siteTitle || pageString,
			' -' + optionalString(siteTitle, ' ' + siteTitle) + pageString
		);

		// If there's a specific meta title
		if (data.meta_title) {
			title = data.meta_title;
			// Home title
		} else if (context.includes('home')) {
			// @ts-ignore
			if (options.property) {
				title = site(optionsPropertyName) || siteTitle;
			} else {
				title = site('meta_title') || siteTitle;
			}
			// Author title, paged
		} else if (context.includes('author') && data.author && context.includes('paged')) {
			title = data.author.name + dashSiteTitlePage;
			// Author title, index
		} else if (context.includes('author') && data.author) {
			title = data.author.name + dashSiteTitle;
			// Tag title, paged
		} else if (context.includes('tag') && data.tag && context.includes('paged')) {
			title = data.tag.meta_title || data.tag.name + dashSiteTitlePage;
			// Tag title, index
		} else if (context.includes('tag') && data.tag) {
			title = data.tag[optionsPropertyName] || data.tag.meta_title || data.tag.name + dashSiteTitle;
			// Post title
		} else if (context.includes('post') && data.post) {
			title = data.post[optionsPropertyName] || data.post.meta_title || data.post.title;
			// Page title dependent on legacy object formatting (https://github.com/TryGhost/Ghost/issues/10042)
		} else if (context.includes('page') && data.post) {
			title = data.post[optionsPropertyName] || data.post.meta_title || data.post.title;
			// Page title v2
		} else if (context.includes('page') && data.page) {
			title = data.page[optionsPropertyName] || data.page.meta_title || data.page.title;
			// Fallback
		} else {
			title = siteTitle + pageString;
		}

		return (title || '').trim();
	});
}
