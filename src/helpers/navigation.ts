// ### Navigation Helper
// `{{navigation}}`
// Outputs navigation menu of static urls
import { HelperOptions } from 'handlebars';
import { Handlebars } from 'workers-hbs';
import NAVIGATION from '../partials/navigation';
import { isEqual } from '../utils/links';
import slugify from '../utils/slugify';
import { WorkersCompatGhost } from '..';

const messages = {
	invalidData: 'navigation data is not an object or is a function',
	valuesMustBeDefined: 'All values must be defined for label, url and current',
	valuesMustBeString: 'Invalid value, Url and Label must be strings',
};

export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper('navigation', function (options: HelperOptions) {
		const key = options.hash?.type === 'secondary' ? 'secondary_navigation' : 'navigation';
		// Set isSecondary so we can compare in the template
		options.hash.isSecondary = !!(options.hash?.type === 'secondary');

		const navigationData = options.data.site[key];
		const currentUrl = options.data.root.relativeUrl;

		if (!navigationData || navigationData.length === 0) {
			return new Handlebars.SafeString('');
		}

		if (!(typeof navigationData === 'object') || typeof navigationData === 'function') {
			throw new Error(messages.invalidData);
		}

		if (navigationData.some((e: any) => e.label === undefined || e.url === undefined)) {
			throw new Error(messages.valuesMustBeDefined);
		}

		if (
			navigationData.some(
				(e: any) =>
					(e.label !== null && typeof e.label !== 'string') ||
					(e.url !== null && typeof e.url !== 'string')
			)
		) {
			throw new Error(messages.valuesMustBeString);
		}

		const navigation = navigationData.map((e: any) => ({
			current: currentUrl ? isEqual(e.url, currentUrl) : false,
			label: e.label,
			slug: slugify(e.label),
			url: e.url,
		}));

		return new Handlebars.SafeString(
			instance.hbs.render(NAVIGATION, { navigation, ...options.hash }, { data: options.data })
		);
	});
}
