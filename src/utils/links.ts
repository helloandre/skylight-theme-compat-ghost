export function clean(url: string) {
	// Strips anchors and leading and trailing slashes
	return url.replace(/#.*?$/, '').replace(/^\/|\/$/g, '');
}

// We want to check if the first part of the current url is a match for href
function isParentMatch(href: string, location: string) {
	if (!location) {
		return false;
	}

	let parent = false;
	let locParts = clean(location).split('/');
	let hrefParts = clean(href).split('/');

	if (locParts.length <= hrefParts.length) {
		return false;
	}

	for (let i = 0; i < hrefParts.length; i += 1) {
		parent = hrefParts[i] === locParts[i];
	}

	return parent;
}

// strips trailing slashes and compares urls
export function isEqual(href: string, location: string) {
	if (!location) {
		return false;
	}

	const strippedHref = clean(href);
	const strippedLocation = clean(location);

	return strippedHref === strippedLocation;
}

export function buildLinkClasses(siteUrl: string, href: string, hash: any, location: string) {
	let relativeHref = href.replace(siteUrl, '');
	let classes = hash.class?.toString().split(' ') || [];
	let activeClass = hash.activeClass ?? 'nav-current';
	let parentActiveClass = hash.parentActiveClass ?? `${activeClass || 'nav-current'}-parent`;

	// Calculate dynamic properties
	if (isEqual(relativeHref, location) && activeClass) {
		classes.push(activeClass);
	} else if (isParentMatch(relativeHref, location) && parentActiveClass) {
		classes.push(parentActiveClass);
	}

	return classes;
}

export function toUrl(...parts: (string | number)[]) {
	return (
		(parts.reduce((acc, part) => (part ? acc + '/' + part : acc), '') as string).replace(
			/\/$/,
			''
		) + '/'
	);
}
