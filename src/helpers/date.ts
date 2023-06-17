// // # Date Helper
// // Usage: `{{date format="DD MM, YYYY"}}`, `{{date updated_at format="DD MM, YYYY"}}`
// //
// // Formats a date using moment-timezone.js. Formats published_at by default but will also take a date as a parameter

import { DateTime } from 'luxon';
import { getSiteData } from '../utils/helper_data';
import { HelperOptions, SafeString } from 'handlebars';
import { WorkersCompatGhost } from '..';

// const moment = require('moment-timezone');
// const _ = require('lodash');

/**
 * For formatting options, @see https://moment.github.io/luxon/#/formatting
 */
export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper(
		'date',
		function (date: string | HelperOptions, options: HelperOptions) {
			if (!options) {
				options = date as HelperOptions;
				date = '';
			}
			// @TODO support magically reading published_at from context
			const site = getSiteData(options);

			let {
				format = 'DD',
				timeago,
				timezone = site.timezone,
				locale = site.locale,
			} = options.hash || {};

			// moment -> luxon
			if (format === 'YYYY') {
				format = 'y';
			}

			const timeNow = DateTime.now().setZone(timezone).setLocale(locale);
			const timeOut = ((date as string).length ? DateTime.fromISO(date as string) : DateTime.now())
				.setZone(timezone)
				.setLocale(locale);

			const out = timeago ? timeNow.toRelative({ base: timeOut }) : timeOut.toFormat(format);

			return new SafeString(out ? out.toString() : '');
		}
	);
}

// module.exports = function (...attrs) {
// 	// Options is the last argument
// 	let date;

// 	// If there is any more arguments, date is the first one
// 	if (!_.isEmpty(attrs)) {
// 		date = attrs.shift();

// 		// If there is no date argument & the current context contains published_at use that by default,
// 		// else date being undefined means moment will use the current date
// 	} else if (this.published_at) {
// 		date = this.published_at;
// 	}

// 	// ensure that date is undefined, not null, as that can cause errors
// 	date = date === null ? undefined : date;

// 	const timeNow = moment().tz(timezone);
// 	// Our date might be user input
// 	let testDateInput = Date.parse(date);
// 	let dateMoment;
// 	if (isNaN(testDateInput) === false) {
// 		dateMoment = moment.parseZone(date);
// 	} else {
// 		dateMoment = timeNow;
// 	}

// 	// i18n: Making dates, including month names, translatable to any language.
// 	// Documentation: http://momentjs.com/docs/#/i18n/
// 	// Locales: https://github.com/moment/moment/tree/develop/locale
// 	if (locale && locale.match('^[^/\\\\]*$') !== null) {
// 		dateMoment.locale(locale);
// 	}

// 	if (timeago) {
// 		date = dateMoment.tz(timezone).from(timeNow);
// 	} else {
// 		date = dateMoment.tz(timezone).format(format);
// 	}

// 	return new SafeString(date);
// };
