import { HelperOptions } from 'handlebars';
import { Handlebars } from 'workers-hbs';
import { getMetadataUrl } from '../utils/urls';
import { WorkersCompatGhost } from '..';

// # URL helper
// Usage: `{{url}}`, `{{url absolute="true"}}`
//
// Returns the URL for the current object scope i.e. If inside a post scope will return post permalink
// `absolute` flag outputs absolute URL, else URL is relative

export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper('url', function (this: any, options: HelperOptions) {
		const absolute = options.hash?.absolute && options.hash.absolute !== 'false';
		let outputUrl = getMetadataUrl(this, absolute);

		try {
			outputUrl = encodeURI(decodeURI(outputUrl)).replace(/%5B/g, '[').replace(/%5D/g, ']');
		} catch (err) {
			return new Handlebars.SafeString('');
		}

		return new Handlebars.SafeString(outputUrl);
	});
}
