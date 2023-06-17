import { HelperOptions, SafeString } from 'handlebars';
import { WorkersCompatGhost } from '..';

// # link_class helper
import { buildLinkClasses } from '../utils/links';
import { getTemplateData } from '../utils/helper_data';
import { ghost } from '../config/ghost';

const messages = {
	forIsRequired: 'The {{link_class}} helper requires a for="" attribute.',
};

export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper('link_class', async function (options: HelperOptions) {
		const hash = options.hash || {};
		const data = getTemplateData(options);

		// If there is no for provided, this is theme dev error, so we throw an error to make this clear.
		if (!hash.hasOwnProperty('for')) {
			throw new Error(messages.forIsRequired);
		}

		// If the for attribute is present but empty, this is probably a dynamic data problem, hard for theme devs to track down
		// E.g. {{link_class for=slug}} in a context where slug returns an empty string
		// Error's here aren't useful (same as with empty get helper filters) so we fallback gracefully
		if (!hash.for || hash.for.string === '') {
			hash.for = '';
		}

		const href = hash.for.string || hash.for;
		const classes = buildLinkClasses(ghost('url'), href, hash, data.relativeUrl);
		return new SafeString(classes.join(' '));
	});
}
