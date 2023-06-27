// # Asset helper
// Usage: `{{asset "css/screen.css"}}`
//

import type { HelperOptions } from 'handlebars';
import { Handlebars } from 'workers-hbs';
import assetUrl from '../utils/asset_url';
import { ghost } from '../config/ghost';
import { WorkersCompatGhost } from '..';

// Returns the path to the specified asset.
const messages = {
	pathIsRequired: 'The {{asset}} helper must be passed a path',
};

export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper('asset', function (path: string, options: HelperOptions) {
		const hasMinFile = options?.hash?.hasMinFile;
		if (!path) {
			throw new Error(messages.pathIsRequired);
		}
		const url = ghost('url');
		const admin = ghost('admin');
		const asset = assetUrl(path, hasMinFile);
		if (url && admin && url !== admin) {
			return new Handlebars.SafeString(new URL(asset, url).href);
		}
		return new Handlebars.SafeString(asset);
	});
}
