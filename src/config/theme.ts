import { init as baseinit, get as baseget } from '.';

type CardAsset =
	| 'audio'
	| 'blockquote'
	| 'bookmark'
	| 'button'
	| 'callout'
	| 'file'
	| 'gallery'
	| 'header'
	| 'nft'
	| 'product'
	| 'toggle'
	| 'video';

// @see https://ghost.org/docs/themes/helpers/custom/
// @see https://ghost.org/docs/themes/custom-settings/
// accessable via @custom
type GhostThemeConfiguration = {
	asset_hash: string;
	posts_per_page?: number;
	image_sizes?: {
		xxs?: {
			width: number;
		};
		xs?: {
			width: number;
		};
		s?: {
			width: number;
		};
		m?: {
			width: number;
		};
		l?: {
			width: number;
		};
		xl?: {
			width: number;
		};
	};
	card_assets: boolean | CardAsset[];
};

export type ThemeConfiguration = GhostThemeConfiguration & {
	defaults: GhostThemeConfiguration & {
		custom?: {
			[idx: string]: {
				type: string;
				options: string[];
				default: string;
			};
		};
	};
};

export function init(config: ThemeConfiguration) {
	const defaults: { [idx: string]: any } = { ...config.defaults };

	if (config.defaults.custom) {
		Object.keys(config.defaults.custom).forEach(key => {
			// @ts-ignore
			// ts is being a little dumb here. we've already checked for existence above
			defaults[key] = config.defaults.custom[key].default;
		});
	}
	delete defaults.custom;

	baseinit('theme', config, defaults);
}

export function theme(path?: string) {
	return baseget('theme', path);
}
