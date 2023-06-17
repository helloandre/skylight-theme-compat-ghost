/** @see https://github.com/TryGhost/SDK/blob/main/packages/url-utils/ */
import { ghost } from '../config/ghost';

export const STATIC_IMAGE_URL_PREFIX = `content/images`;

const KNOWN_PATHS = {
	home: '/',
	// sitemap_xsl: '/sitemap.xsl',
};

export function urlFor(context: string, data?: any, absolute?: boolean) {
	let urlPath = '/';

	if (typeof data === 'boolean') {
		absolute = data;
		data = {};
	}

	if (context === 'image' && data?.image) {
		const siteUrl = baseUrl(true);
		urlPath = data?.image;
		absolute = new RegExp('^' + siteUrl + '/' + STATIC_IMAGE_URL_PREFIX).test(data?.image)
			? absolute
			: false;

		if (absolute) {
			// Remove the sub-directory from the URL because ghostConfig will add it back.
			urlPath = siteUrl.replace(/\/$/, '') + urlPath.replace(new RegExp('^' + siteUrl), '');
		}

		return urlPath;
	} else if (context === 'nav' && data?.nav) {
		urlPath = data.nav.url;
		const { hostname, pathname } = new URL(baseUrl(true));

		// If the hostname is present in the url
		if (
			urlPath.indexOf(hostname) > -1 &&
			// do no not apply, if there is a subdomain, or a mailto link
			!urlPath.split(hostname)[0].match(/\.|mailto:/) &&
			// do not apply, if there is a port after the hostname
			urlPath.split(hostname)[1].substring(0, 1) !== ':'
		) {
			// make link relative to account for possible mismatch in http/https etc, force absolute
			urlPath = urlJoin('/', pathname);
			absolute = true;
		}
	} else if (context === 'home' && absolute) {
		urlPath = baseUrl(absolute);

		// CASE: there are cases where urlFor('home') needs to be returned without trailing
		// slash e. g. the `{{@site.url}}` helper. See https://github.com/TryGhost/Ghost/issues/8569
		if (data?.trailingSlash === false) {
			urlPath = urlPath.replace(/\/$/, '');
		}
	} else if (context === 'admin') {
		urlPath = adminUrl();
	} else if (context === 'api') {
		let apiPath = '/api/';

		if (data.type && ['admin', 'content'].includes(data.type)) {
			apiPath += data.type;
		} else {
			apiPath += 'content';
		}

		// Ensure we end with a trailing slash
		apiPath += '/';
		urlPath = absolute ? urlJoin(adminUrl(), apiPath) : apiPath;
	} else if (KNOWN_PATHS.hasOwnProperty(context)) {
		// trying to create a url for a named path
		// @ts-ignore
		urlPath = KNOWN_PATHS[context];
	} else if (typeof context === 'string') {
		urlPath = context;
	}

	// This url already has a protocol so is likely an external url to be returned
	// or it is an alternative scheme, protocol-less, or an anchor-only path
	if (urlPath && (urlPath.indexOf('://') !== -1 || urlPath.match(/^(\/\/|#|[a-zA-Z0-9-]+:)/))) {
		return urlPath;
	}

	if (data?.trailingSlash) {
		if (!urlPath.match(/\/$/)) {
			urlPath += '/';
		}
	}

	return urlJoin(baseUrl(absolute), urlPath);
}

/**
 * Remove duplicated directories from the start of a path or url's path
 *
 * @param {string} url URL or pathname with possible duplicate subdirectory
 * @param {string} rootUrl Root URL with an optional subdirectory
 * @returns {string} URL or pathname with any duplicated subdirectory removed
 */
function deduplicateSubdirectory(url: string, rootUrl: string) {
	// force root url to always have a trailing-slash for consistent behaviour
	if (!rootUrl.endsWith('/')) {
		rootUrl = `${rootUrl}/`;
	}

	const parsedRoot = new URL(rootUrl);

	// do nothing if rootUrl does not have a subdirectory
	if (parsedRoot.pathname === '/') {
		return url;
	}

	const subdir = parsedRoot.pathname.replace(/(^\/|\/$)+/g, '');
	// we can have subdirs that match TLDs so we need to restrict matches to
	// duplicates that start with a / or the beginning of the url
	const subdirRegex = new RegExp(`(^|/)${subdir}/${subdir}(/|$)`);

	return url.replace(subdirRegex, `$1${subdir}/`);
}

function urlJoin(...parts: string[]) {
	let prefixDoubleSlash = false;

	// Remove empty item at the beginning
	if (parts[0] === '') {
		parts.shift();
	}

	// Handle schemeless protocols
	if (parts[0].indexOf('//') === 0) {
		prefixDoubleSlash = true;
	}

	// join the elements using a slash
	let url = parts.join('/');

	// Fix multiple slashes
	url = url.replace(/(^|[^:])\/\/+/g, '$1/');

	// Put the double slash back at the beginning if this was a schemeless protocol
	if (prefixDoubleSlash) {
		url = url.replace(/^\//, '//');
	}

	return deduplicateSubdirectory(url, ghost('url'));
}

function baseUrl(absolute?: boolean): string {
	return absolute ? ghost('url') : ghost('subdir');
}

function adminUrl(): string {
	return ghost('admin.url') || ghost('url');
}

export function getMetadataUrl(data: any, absolute?: boolean) {
	if (isPost(data)) {
		/**
		 * @NOTE
		 *
		 * We return the post preview url if you are making use of the `{{url}}` helper and the post is not published.
		 * If we don't do it, we can break Disqus a bit. See https://github.com/TryGhost/Ghost/issues/9727.
		 *
		 * This short term fix needs a better solution than this, because this is inconsistent with our private API. The
		 * private API would still return /404/ for drafts. The public API doesn't serve any drafts - nothing we have to
		 * worry about. We first would like to see if this resolves the Disqus bug when commenting on preview pages.
		 *
		 * A long term solution should be part of the final version of Dynamic Routing.
		 */
		if (data.status !== 'published') {
			return urlFor(urlJoin('/p', data.uuid, '/'), null, absolute);
		}

		return urlFor(urlJoin(ghost('subdir') ?? '', data.slug, '/'), null, absolute);
	}

	if (isTag(data)) {
		return urlFor(urlJoin(ghost('subdir') ?? '', '/tag/', data.slug, '/'), null, absolute);
	}

	if (isUser(data)) {
		return urlFor(urlJoin(ghost('subdir') ?? '', '/author/', data.slug, '/'), null, absolute);
	}

	if (isNav(data)) {
		return urlFor('nav', { nav: data }, absolute);
	}

	return urlFor(data, null, absolute);
}

function isPost(jsonData: any) {
	return (
		jsonData.hasOwnProperty('html') &&
		jsonData.hasOwnProperty('title') &&
		jsonData.hasOwnProperty('slug')
	);
}

function isTag(jsonData: any) {
	return (
		jsonData.hasOwnProperty('name') &&
		jsonData.hasOwnProperty('slug') &&
		jsonData.hasOwnProperty('description') &&
		jsonData.hasOwnProperty('feature_image')
	);
}

function isUser(jsonData: any) {
	return (
		jsonData.hasOwnProperty('bio') &&
		jsonData.hasOwnProperty('website') &&
		jsonData.hasOwnProperty('profile_image') &&
		jsonData.hasOwnProperty('location')
	);
}

export type NavigationObject = {
	label: string | null;
	url: string | null;
	slug: string | null;
	current: boolean;
};
function isNav(jsonData: any) {
	return (
		jsonData.hasOwnProperty('label') &&
		jsonData.hasOwnProperty('url') &&
		jsonData.hasOwnProperty('slug') &&
		jsonData.hasOwnProperty('current')
	);
}
