import { HelperOptions } from 'handlebars';

export function getContext(options: HelperOptions) {
	return getTemplateData(options).context || [];
}

export function getTemplateData(options: HelperOptions) {
	return options.data?.root?.runtimeOptions?.data?._locals || {};
}

export function getSiteData(options: HelperOptions) {
	return options.data?.root?.runtimeOptions?.data?.site || {};
}
