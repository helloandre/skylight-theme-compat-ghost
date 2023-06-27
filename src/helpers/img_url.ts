// Usage:
// `{{img_url feature_image}}`
// `{{img_url profile_image absolute="true"}}`
// Note:
// `{{img_url}}` - does not work, argument is required
//
// Returns the URL for the current object scope i.e. If inside a post scope will return image permalink
// `absolute` flag outputs absolute URL, else URL is relative.
import type { HelperOptions } from 'handlebars';
import { WorkersCompatGhost } from '..';
// we get this from requiring node_compat=true in wrangler.toml
// @ts-ignore-next
import url from 'url';
import { ghost } from '../config/ghost';
import { STATIC_IMAGE_URL_PREFIX } from '../utils/urls';

const messages = {
	attrIsRequired: 'Attribute is required e.g. {{img_url feature_image}}',
};

type SizeOptions = {
	requestedSize?: string;
	imageSizes?: { [idx: string]: { width: string; height: string } };
	requestedFormat?: string;
};

/**
 * A Very simplified version of img_url
 *
 * this may incorrectly do the relative/absolute thing, not sure yet
 */
export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper(
		'img_url',
		function (requestedImageUrl: string, options: HelperOptions) {
			// CASE: if no url is passed, e.g. `{{img_url}}` we show a warning
			if (arguments.length < 2) {
				// logging.warn(tpl(messages.attrIsRequired));
				return;
			}

			// CASE: if url is passed, but it is undefined, then the attribute was
			// an unknown value, e.g. {{img_url feature_img}} and we also show a warning
			if (requestedImageUrl === undefined) {
				// logging.warn(tpl(messages.attrIsRequired));
				return;
			}

			// CASE: if you pass e.g. cover_image, but it is not set, then requestedImageUrl is null!
			// in this case we don't show a warning
			if (requestedImageUrl === null) {
				return;
			}

			// CASE: if you pass an external image, there is nothing we want to do to it!
			const siteUrl = ghost('url');
			const isInternalImage = detectInternalImage(requestedImageUrl, siteUrl);
			const sizeOptions = getImageSizeOptions(options);

			if (!isInternalImage) {
				// Detect Unsplash width and format
				if (/images\.unsplash\.com/.test(requestedImageUrl)) {
					try {
						return getUnsplashImage(requestedImageUrl, sizeOptions);
					} catch (e) {
						// ignore errors and just return the original URL
					}
				}

				return requestedImageUrl;
			}

			return [
				getAbsoluteOption(options) ? siteUrl + '/' : '',
				requestedImageUrl.startsWith('/') ? '/' : '',
				STATIC_IMAGE_URL_PREFIX,
				'/',
				getImageWithSize(requestedImageUrl, sizeOptions)
					.replace(new RegExp(`^${siteUrl}`), '')
					.replace(new RegExp(`^/?${STATIC_IMAGE_URL_PREFIX}`), ''),
			].join('');
		}
	);
}

function getAbsoluteOption(options: HelperOptions) {
	const absoluteOption = options.hash?.absolute;

	return absoluteOption ? !!absoluteOption && absoluteOption !== 'false' : false;
}

function getImageSizeOptions(options: HelperOptions) {
	const requestedSize = options.hash?.size;
	const imageSizes = options.data?.config?.image_sizes;
	const requestedFormat = options.hash?.format;

	return {
		requestedSize,
		imageSizes,
		requestedFormat,
	};
}

function detectInternalImage(requestedImageUrl: string, siteUrl: string) {
	const isAbsoluteImage = /https?:\/\//.test(requestedImageUrl);
	const isAbsoluteInternalImage = isAbsoluteImage && requestedImageUrl.startsWith(siteUrl);

	// CASE: imagePath is a "protocol relative" url e.g. "//www.gravatar.com/ava..."
	//       by resolving the the imagePath relative to the blog url, we can then
	//       detect if the imagePath is external, or internal.
	const isRelativeInternalImage =
		!isAbsoluteImage && url.resolve(siteUrl, requestedImageUrl).startsWith(siteUrl);

	return isAbsoluteInternalImage || isRelativeInternalImage;
}

function getUnsplashImage(imagePath: string, sizeOptions: SizeOptions) {
	// sshhh, we do have URL
	// @ts-ignore-next
	const parsedUrl = new URL(imagePath);
	const { requestedSize, imageSizes, requestedFormat } = sizeOptions;

	if (requestedFormat) {
		const supportedFormats = ['avif', 'gif', 'jpg', 'png', 'webp'];
		if (supportedFormats.includes(requestedFormat)) {
			parsedUrl.searchParams.set('fm', requestedFormat);
		} else if (requestedFormat === 'jpeg') {
			// Map to alias
			parsedUrl.searchParams.set('fm', 'jpg');
		}
	}

	if (!requestedSize) {
		return imagePath;
	}

	if (!imageSizes || !imageSizes[requestedSize]) {
		return parsedUrl.toString();
	}

	const { width, height } = imageSizes[requestedSize];

	if (!width && !height) {
		return parsedUrl.toString();
	}

	parsedUrl.searchParams.delete('w');
	parsedUrl.searchParams.delete('h');

	if (width) {
		parsedUrl.searchParams.set('w', width);
	}
	if (height) {
		parsedUrl.searchParams.set('h', height);
	}
	return parsedUrl.toString();
}

/**
 *
 * @param {string} imagePath
 * @param {Object} sizeOptions
 * @param {string} sizeOptions.requestedSize
 * @param {Object[]} sizeOptions.imageSizes
 * @param {string} [sizeOptions.requestedFormat]
 * @returns
 */
function getImageWithSize(imagePath: string, sizeOptions: SizeOptions): string {
	const hasLeadingSlash = imagePath[0] === '/';

	if (hasLeadingSlash) {
		return '/' + getImageWithSize(imagePath.slice(1), sizeOptions);
	}
	const { requestedSize, imageSizes, requestedFormat } = sizeOptions;

	if (!requestedSize) {
		return imagePath;
	}

	if (!imageSizes || !imageSizes[requestedSize]) {
		return imagePath;
	}

	const { width, height } = imageSizes[requestedSize];

	if (!width && !height) {
		return imagePath;
	}

	const [imgBlogUrl, imageName] = imagePath.split(STATIC_IMAGE_URL_PREFIX);

	const sizeDirectoryName = prefixIfPresent('w', width) + prefixIfPresent('h', height);
	const formatPrefix = requestedFormat ? `/format/${requestedFormat}` : '';

	return [
		imgBlogUrl,
		STATIC_IMAGE_URL_PREFIX,
		`/size/${sizeDirectoryName}`,
		formatPrefix,
		imageName,
	].join('');
}

function prefixIfPresent(prefix: string, str: string) {
	return str ? prefix + str : '';
}
