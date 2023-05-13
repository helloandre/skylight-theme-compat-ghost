// # Asset helper
// Usage: `{{asset "css/screen.css"}}`
//

import { HelperOptions } from 'handlebars';
import { SafeString } from 'workers-hbs';
import assetUrl from '../utils/asset_url';
import globalSettings from '../global_settings';

// Returns the path to the specified asset.
const messages = {
	pathIsRequired: 'The {{asset}} helper must be passed a path',
};

export default function asset(path: string, options: HelperOptions) {
	const hasMinFile = options?.hash?.hasMinFile;
	if (!path) {
		throw new Error(messages.pathIsRequired);
	}
	const url = globalSettings.get('url');
	const admin = globalSettings.get('admin');
	if (url && admin && url !== admin) {
		const target = new URL(assetUrl(path, hasMinFile), globalSettings.get('url'));
		return new SafeString(target.href);
	}
	return new SafeString(assetUrl(path, hasMinFile));
}
