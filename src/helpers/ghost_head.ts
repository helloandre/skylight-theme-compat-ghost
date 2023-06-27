// # Ghost Head Helper
// Usage: `{{ghost_head}}`
//
import type { HelperOptions } from 'handlebars';
import { Handlebars } from 'workers-hbs';
import { WorkersCompatGhost } from '..';
import { site as siteConfig } from '../config/site';
import { privacyDisabled, ghost as ghostConfig } from '../config/ghost';
import { GhostMetadata, metadata } from '../utils/metadata/index';
import isEmpty from '../utils/is_empty';

function iconType(icon: string) {
	// If the native format is supported, return the native format
	if (icon.match(/.ico$/i)) {
		return 'ico';
	}

	if (icon.match(/.jpe?g$/i)) {
		return 'jpeg';
	}

	if (icon.match(/.png$/i)) {
		return 'png';
	}

	// Default to png for all other types
	return 'png';
}

function has(arr: string[], val: string) {
	return arr && arr.includes(val);
}

export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper('ghost_head', function (options: HelperOptions) {
		// if server error page do nothing
		// TODO support errors
		if (options.data.root.statusCode >= 500) {
			return;
		}

		const head: string[] = [];
		const dataRoot = options.data.root;
		const context = dataRoot._locals.context ?? null;
		const safeVersion = dataRoot._locals.safeVersion;
		const postCodeInjection = dataRoot?.post?.codeinjection_head;
		const tagCodeInjection = dataRoot?.tag?.codeinjection_head;
		const globalCodeinjection = siteConfig('codeinjection_head');
		const useStructuredData = !privacyDisabled('useStructuredData');
		const referrerPolicy = ghostConfig('referrerPolicy') ?? 'no-referrer-when-downgrade';

		try {
			const meta = metadata(dataRoot, context);
			// const frontendKey = await getFrontendKey();

			if (context) {
				// head is our main array that holds our meta data
				if (meta.metaDescription && meta.metaDescription.length > 0) {
					head.push(
						'<meta name="description" content="' +
							Handlebars.escapeExpression(meta.metaDescription) +
							'" />'
					);
				}

				// no output in head if a publication icon is not set
				if (siteConfig('icon')) {
					const favicon = siteConfig('icon');
					head.push(`<link rel="icon" href="${favicon}" type="image/${iconType(favicon)}" />`);
				}

				head.push(
					'<link rel="canonical" href="' + Handlebars.escapeExpression(meta.canonicalUrl) + '" />'
				);

				if (has(context, 'preview')) {
					head.push(writeMetaTag('robots', 'noindex,nofollow', 'name'));
					head.push(writeMetaTag('referrer', 'same-origin', 'name'));
				} else {
					head.push(writeMetaTag('referrer', referrerPolicy, 'name'));
				}

				// show amp link in post when 1. we are not on the amp page and 2. amp is enabled
				// this is deprecated, right? amp is dead?
				// if (
				// 	has(context, 'post') &&
				// 	!has(context, 'amp') &&
				// 	settingsCache.get('amp')
				// ) {
				// 	head.push('<link rel="amphtml" href="' + Handlebars.escapeExpression(meta.ampUrl) + '" />');
				// }

				if (meta.previousUrl) {
					head.push(
						'<link rel="prev" href="' + Handlebars.escapeExpression(meta.previousUrl) + '" />'
					);
				}

				if (meta.nextUrl) {
					head.push('<link rel="next" href="' + Handlebars.escapeExpression(meta.nextUrl) + '" />');
				}

				if (!has(context, 'paged') && useStructuredData) {
					head.push('');
					head.push.apply(head, finaliseStructuredData(meta));
					head.push('');

					if (meta.schema) {
						head.push(
							'<script type="application/ld+json">\n' +
								JSON.stringify(meta.schema, null, '    ') +
								'\n    </script>\n'
						);
					}
				}
			}

			head.push(
				'<meta name="generator" content="Ghost ' + Handlebars.escapeExpression(safeVersion) + '" />'
			);

			head.push(
				'<link rel="alternate" type="application/rss+xml" title="' +
					Handlebars.escapeExpression(meta.site.title) +
					'" href="' +
					Handlebars.escapeExpression(meta.rssUrl) +
					'" />'
			);

			// no code injection for amp context!!!
			if (!has(context, 'amp')) {
				// head.push(getMembersHelper(options.data, frontendKey));
				// head.push(getSearchHelper(frontendKey));

				// @TODO do this in a more "frameworky" way
				// if (cardAssetService.hasFile('js')) {
				// 	head.push(`<script defer src="${getAssetUrl('public/cards.min.js')}"></script>`);
				// }
				// if (cardAssetService.hasFile('css')) {
				// 	head.push(
				// 		`<link rel="stylesheet" type="text/css" href="${getAssetUrl('public/cards.min.css')}">`
				// 	);
				// }

				// if (settingsCache.get('comments_enabled') !== 'off') {
				// 	head.push(
				// 		`<script defer src="${getAssetUrl(
				// 			'public/comment-counts.min.js'
				// 		)}" data-ghost-comments-counts-api="${urlUtils.getSiteUrl(
				// 			true
				// 		)}members/api/comments/counts/"></script>`
				// 	);
				// }

				// if (settingsCache.get('members_enabled') && settingsCache.get('members_track_sources')) {
				// 	head.push(
				// 		`<script defer src="${getAssetUrl('public/member-attribution.min.js')}"></script>`
				// 	);
				// }

				if (!isEmpty(globalCodeinjection)) {
					head.push(globalCodeinjection);
				}

				if (!isEmpty(postCodeInjection)) {
					head.push(postCodeInjection);
				}

				if (!isEmpty(tagCodeInjection)) {
					head.push(tagCodeInjection);
				}
			}

			// AMP template has style injected directly because there can only be one <style amp-custom> tag
			if (siteConfig('accent_color') && !has(context, 'amp')) {
				const accentColor = Handlebars.escapeExpression(options.data.site.accent_color);
				const styleTag = `<style>:root {--ghost-accent-color: ${accentColor};}</style>`;
				const existingScriptIndex = head.findLastIndex(str => str.match(/<\/(style|script)>/));

				if (existingScriptIndex !== -1) {
					head[existingScriptIndex] = head[existingScriptIndex] + styleTag;
				} else {
					head.push(styleTag);
				}
			}
			return new Handlebars.SafeString(head.join('\n    ').trim());
		} catch (error) {
			// Return what we have so far (currently nothing)
			return new Handlebars.SafeString(head.join('\n    ').trim());
		}
	});
}

function writeMetaTag(property: string, content: string, type?: string) {
	type = type || property.substring(0, 7) === 'twitter' ? 'name' : 'property';
	return '<meta ' + type + '="' + property + '" content="' + content + '" />';
}

function finaliseStructuredData(meta: GhostMetadata) {
	const head: string[] = [];

	Object.keys(meta.structuredData).forEach(property => {
		let content = meta.structuredData[property as keyof GhostMetadata['structuredData']];
		if (Array.isArray(content)) {
			content = content.join(',');
		}

		if (property === 'article:tag') {
			meta.keywords?.forEach(keyword => {
				if (keyword !== '') {
					keyword = Handlebars.escapeExpression(keyword);
					head.push(writeMetaTag(property, Handlebars.escapeExpression(keyword)));
				}
			});
			head.push('');
		} else if (content !== null && content !== undefined) {
			head.push(writeMetaTag(property, Handlebars.escapeExpression(content)));
		}
	});

	return head;
}

// function getMembersHelper(data, frontendKey) {
// 	if (!settingsCache.get('members_enabled')) {
// 		return '';
// 	}
// 	const { scriptUrl } = getFrontendAppConfig('portal');

// 	const colorString =
// 		_.has(data, 'site._preview') && data.site.accent_color ? data.site.accent_color : '';
// 	const attributes = {
// 		ghost: urlUtils.getSiteUrl(),
// 		key: frontendKey,
// 		api: urlUtils.urlFor('api', { type: 'content' }, true),
// 	};
// 	if (colorString) {
// 		attributes['accent-color'] = colorString;
// 	}
// 	const dataAttributes = getDataAttributes(attributes);

// 	let membersHelper = `<script defer src="${scriptUrl}" ${dataAttributes} crossorigin="anonymous"></script>`;
// 	membersHelper += `<style id="gh-members-styles">${templateStyles}</style>`;
// 	if (settingsCache.get('paid_members_enabled')) {
// 		membersHelper += '<script async src="https://js.stripe.com/v3/"></script>';
// 	}
// 	return membersHelper;
// }

// function getSearchHelper(frontendKey) {
// 	const adminUrl = urlUtils.getAdminUrl() || urlUtils.getSiteUrl();
// 	const { scriptUrl, stylesUrl } = getFrontendAppConfig('sodoSearch');
// 	const attrs = {
// 		'key': frontendKey,
// 		'styles': stylesUrl,
// 		'sodo-search': adminUrl,
// 	};
// 	const dataAttrs = getDataAttributes(attrs);
// 	let helper = `<script defer src="${scriptUrl}" ${dataAttrs} crossorigin="anonymous"></script>`;

// 	return helper;
// }
