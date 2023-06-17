import { GhostConfiguration } from './ghost';
import { init as baseinit, get as baseget } from '.';

// @see https://ghost.org/docs/themes/helpers/site/
// accessable via @site
export type SiteConfiguration = {
	accent_color?: string;
	cover_image?: string;
	description?: string;
	facebook?: string;
	icon?: string;
	locale?: string;
	logo?: string;
	navigation?: string; // Array<{ label: string, url: string }>
	secondary_navigation?: string; // // Array<{ label: string, url: string }>
	posts_per_page?: string;
	signup_url?: string;
	timezone?: string;
	title?: string;
	twitter?: string;
	url?: string; // generated
	codeinjection_header?: string;
	codeinjection_footer?: string;
	// @TODO
	// members_enabled
	// members_invite_only
	// paid_members_enabled
	meta_title?: string;
	meta_description?: string;
	twitter_image?: string;
	twitter_title?: string;
	twitter_description?: string;
	og_image?: string;
	og_title?: string;
	og_description?: string;
};

const DEFAULTS: SiteConfiguration = {
	locale: 'en',
};

export function init(config: SiteConfiguration, ghost: GhostConfiguration) {
	if (!config.url) {
		config.url = ghost.url;
	}
	baseinit('site', DEFAULTS, config);
}

export function site(path?: string) {
	return baseget('site', path);
}
