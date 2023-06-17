import { HelperOptions } from 'handlebars';

export function getContext(options: HelperOptions) {
	return getTemplateData(options).context || [];
}

export function getTemplateData(options: HelperOptions) {
	return options.data?.root || {};
}

export function getSiteData(options: HelperOptions) {
	return options.data?.root?.site || {};
}
