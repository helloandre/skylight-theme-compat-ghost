// const crypto = require('crypto');
// const config = require('../../shared/config');
// const { blogIcon } = require('../../server/lib/image');
// const urlUtils = require('../../shared/url-utils');
import globalSettings from '../global_settings';

/**
 * Serve either uploaded favicon or default
 * @return {string}
 */
function getFaviconUrl() {
	return `/content/images/favicon.ico`;
	// return blogIcon.getIconUrl();
}

export default function getAssetUrl(path: string, hasMinFile: boolean) {
	// CASE: favicon - this is special path with its own functionality
	if (path.match(/\/?favicon\.(ico|png)$/)) {
		// @TODO, resolve this - we should only be resolving subdirectory and extension.
		return getFaviconUrl();
	}

	// normalize start of url
	// remove leading slash and/or "assets"
	path = path.replace(/^\/?(assets)?/, '');

	// replace ".foo" with ".min.foo" if configured
	if (hasMinFile && globalSettings.get('useMinFiles') !== false) {
		path = path.replace(/\.([^.]*)$/, '.min.$1');
	}

	// if url has # make sure the hash is at the right place
	let anchor = '';
	if (path.match('#')) {
		const index = path.indexOf('#');
		anchor = path.substring(index);
		path = path.slice(0, index);
	}

	// prepend the subdir
	const output = [
		globalSettings.get('subdir') + '/',
		globalSettings.get('paths')?.contentPath ?? 'content',
		'/',
		'assets/',
		path,
		'?v=' + globalSettings.get('assetHash'),
	].join('');

	return output + anchor;
}
