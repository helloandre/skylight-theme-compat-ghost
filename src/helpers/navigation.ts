// ### Navigation Helper
// `{{navigation}}`
// Outputs navigation menu of static urls
import { HelperOptions } from 'handlebars';
import { SafeString } from 'workers-hbs';
import NAVIGATION from '../partials/navigation';
import { getTemplateData } from '../utils/helper_data';
import { NavigationSettings, WorkersCompatGhost } from '..';
import { isEqual } from '../utils/links';
import slugify from '../utils/slugify';

const messages = {
	invalidData: 'navigation data is not an object or is a function',
	valuesMustBeDefined: 'All values must be defined for label, url and current',
	valuesMustBeString: 'Invalid value, Url and Label must be strings',
};

export default function navigation(this: WorkersCompatGhost, options: HelperOptions) {
	const hash = options.hash || {};
	const data = getTemplateData(options);

	if (!(typeof data.navigation === 'object') || typeof data.navigation === 'function') {
		throw new Error(messages.invalidData);
	}

	const key = hash.type === 'secondary' ? 'secondary_navigation' : 'navigation';
	// Set isSecondary so we can compare in the template
	const isSecondary = !!(options.hash.type && options.hash.type === 'secondary');
	const currentUrl = data.relativeUrl;

	// {{navigation}} should no-op if no data passed in
	console.log('data', data);
	if (data.navigation.length === 0) {
		return new SafeString('');
	}

	const navigation: any = (data.navigation as NavigationSettings).map(({ url, label, slug }) => ({
		label,
		url,
		slug: slug ?? slugify(label),
		current: isEqual(url, currentUrl),
	}));
	console.log({ navigation });

	return this.hbs.render(
		NAVIGATION,
		{ navigation, isSecondary, ...hash },
		{ data: { _locals: data } }
	);
}
