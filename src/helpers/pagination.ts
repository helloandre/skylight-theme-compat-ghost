// ### Pagination Helper
// `{{pagination}}`
// Outputs previous and next buttons, along with info about the current page

import { HelperOptions } from 'handlebars';
import { getTemplateData } from '../utils/helper_data';
import PAGINATION from '../partials/pagination';
import { WorkersCompatGhost } from '..';

const messages = {
	invalidData:
		'The {{pagination}} helper was used outside of a paginated context. See https://ghost.org/docs/themes/helpers/pagination/.',
	valuesMustBeDefined: 'All values must be defined for page, pages, limit and total',
	nextPrevValuesMustBeNumeric: 'Invalid value, Next/Prev must be a number',
	valuesMustBeNumeric: 'Invalid value, check page, pages, limit and total are numbers',
};

export default function pagination(this: WorkersCompatGhost, options: HelperOptions) {
	const data = getTemplateData(options);

	if (!(typeof data.pagination === 'object') || typeof data.pagination === 'function') {
		throw new Error(messages.invalidData);
	}

	const { next, prev, page, pages, total, limit } = data.pagination;
	if (page === undefined || pages === undefined || total === undefined || limit === undefined) {
		throw new Error(messages.valuesMustBeDefined);
	}

	// @TODO
	// if (
	// 	(!_.isNull(data.pagination.next) && !_.isNumber(data.pagination.next)) ||
	// 	(!_.isNull(data.pagination.prev) && !_.isNumber(data.pagination.prev))
	// ) {
	// 	throw new Error(messages.nextPrevValuesMustBeNumeric);
	// }

	// if (
	// 	!_.isNumber(data.pagination.page) ||
	// 	!_.isNumber(data.pagination.pages) ||
	// 	!_.isNumber(data.pagination.total) ||
	// 	!_.isNumber(data.pagination.limit)
	// ) {
	// 	throw new Error(messages.valuesMustBeNumeric);
	// }

	// we cheat here and wrap the pagination with a {{#with pagination}}
	// because that's essentially what ghost is doing, but, like, less transparently
	return this.hbs.render(
		'{{#with pagination}}' + PAGINATION + '{{/with}}',
		{ ...data.pagination },
		{ data: { _locals: data } }
	);
}
