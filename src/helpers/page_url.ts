import { HelperOptions } from 'handlebars';
import { getTemplateData } from '../utils/helper_data';
import globalSettings from '../global_settings';
import { toUrl, clean } from '../utils/links';

export default function page_url(page: string | HelperOptions, options?: HelperOptions) {
	if (!options) {
		options = page as HelperOptions;
		page = '1';
	}
	const data = getTemplateData(options);

	// If we don't have enough information, return null right away
	if (!data || !data.relativeUrl || !data.pagination) {
		return '';
	}

	// assumptions:
	//  - the urls always *ends* with /page/\d+/

	// strip the trailing page if there is any
	const prefix = options.hash?.absolute ? globalSettings.get('url') : globalSettings.get('subdir');
	const baseUrl = data.relativeUrl.replace(/\/page\/\d+\/?/, '').replace(/\/$/, '');

	if (page === 'next' && data.pagination.next) {
		return toUrl(prefix, baseUrl, 'page', data.pagination.next);
	} else if (page === 'prev' && data.pagination.prev) {
		return data.pagination.prev > 1
			? toUrl(prefix, baseUrl, 'page', data.pagination.prev)
			: toUrl(prefix, baseUrl);
	} else if (/0-9/.test(page as string)) {
		return parseInt(page as string, 10) > 1
			? toUrl(prefix, baseUrl, 'page', page as string)
			: toUrl(prefix, baseUrl);
	}

	// If none of the cases match, return null right away
	return '';
}
