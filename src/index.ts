// @ts-ignore-next
import { WorkersHbs, Handlebars } from 'workers-hbs';
import { GhostConfiguration, init as ghostInit } from './config/ghost';
import { SiteConfiguration, site as siteConfig, init as siteInit } from './config/site';
import { ThemeConfiguration, theme as themeConfig, init as customInit } from './config/theme';
import { layout_tree, LAYOUT_PATTERN } from './utils/layout_tree';

// helper registerers
// this follows the same pattern as Handlebars/WorkersHBS
// but diverges quite a bit from Ghost
import asset from './helpers/asset';
import authors from './helpers/authors';
import block from './helpers/block';
import body_class from './helpers/body_class';
import concat from './helpers/concat';
import content from './helpers/content';
import content_for from './helpers/content_for';
import date from './helpers/date';
import excerpt from './helpers/excerpt';
import foreach from './helpers/foreach';
import get from './helpers/get';
import ghost_foot from './helpers/ghost_foot';
import ghost_head from './helpers/ghost_head';
import has from './helpers/has';
import img_url from './helpers/img_url';
import is from './helpers/is';
import link_class from './helpers/link_class';
import match from './helpers/match';
import meta_title from './helpers/meta_title';
import navigation from './helpers/navigation';
import pagination from './helpers/pagination';
import page_url from './helpers/page_url';
import post_class from './helpers/post_class';
import url from './helpers/url';

const HELPERS: { [idx: string]: (inst: WorkersCompatGhost) => void } = {
	asset,
	authors,
	block,
	body_class,
	concat,
	content,
	content_for,
	date,
	excerpt,
	foreach,
	get,
	ghost_foot,
	ghost_head,
	has,
	img_url,
	is,
	link_class,
	match,
	meta_title,
	navigation,
	pagination,
	page_url,
	post_class,
	url,
};

export type { ThemeConfiguration } from './config/theme';
export type { SiteConfiguration } from './config/site';
export type { GhostConfiguration } from './config/ghost';
export type TemplatesObj = {
	index: string;
	post: string;
	[idx: string]: string;
};
export type PartialsObj = {
	[idx: string]: string;
};

export type TemplateContextParam = {
	context: string[];
	relativeUrl: string;
	pagination?: PaginationSettings;
	[idx: string]: any;
};

export type NavigationItem = {
	url: string;
	label: string;
	slug?: string;
};
export type NavigationSettings = NavigationItem[];

export type PaginationSettings = {
	page: number;
	pages: number;
	total: number;
	limit: number;
	next?: number;
	prev?: number;
};

const SAFE_VERSION = '0.0.1';

export class WorkersCompatGhost {
	hbs: typeof WorkersHbs;
	// we know this is empty, this is checked later
	// @ts-ignore-next
	private templates: TemplatesObj;
	// @ts-ignore-next
	private settings: GhostSettings;
	// passed to workers-hbs render
	private context: any = {};
	private runtimeOptions: any = {};

	constructor() {
		this.hbs = new WorkersHbs();

		Object.keys(HELPERS).forEach(key => HELPERS[key](this));
	}

	/**
	 * register an object of templates.
	 *
	 * the object key can be a path.
	 * e.g. { 'posts/new-version': '...' }
	 *
	 * layouts can be referenced relatively
	 * e.g. {{!< ../default }}
	 *
	 * @see https://ghost.org/docs/themes/structure/#templates
	 */
	withTemplates(templates: TemplatesObj) {
		this.templates = templates;

		return this;
	}

	withPartials(partials: PartialsObj) {
		Object.keys(partials).forEach(name => this.hbs.registerPartial(name, partials[name]));

		return this;
	}

	/**
	 * @see https://ghost.org/docs/config/
	 * @see https://ghost.org/docs/themes/helpers/site/
	 * @see https://ghost.org/docs/themes/custom-settings/
	 *
	 * ghost - typically statically defined via a config file, per-environment
	 * site - dynamically defined, provided by ghost settings panel.
	 * custom - dynamically defined, as expected by the current theme
	 */
	withConfig(ghost: GhostConfiguration, site: SiteConfiguration, custom: ThemeConfiguration) {
		ghostInit(ghost);
		siteInit(site, ghost);
		customInit(custom);

		return this;
	}

	/* begin public methods */

	/**
	 *
	 * @param templateName @see https://ghost.org/docs/themes/structure/#templates
	 * @param root any other data needed by the template
	 * 		for root.context @see https://ghost.org/docs/themes/contexts/
	 */
	render(templateName: keyof TemplatesObj, root: TemplateContextParam) {
		const site = siteConfig();
		const theme = themeConfig();

		// man, i dunno
		// @see https://github.com/TryGhost/Ghost/blob/5b2ba79cef8d751c57e6ae214a458f03719511b0/ghost/core/core/frontend/helpers/ghost_head.js#L138
		root._locals = {
			context: root.context,
			safeVersion: SAFE_VERSION,
		};

		// @TODO add things from the Ghost Context (like post, etc)
		this.context = {
			meta_title: site.meta_title,
			...root,
		};

		this.runtimeOptions = {
			// available via @-variables
			data: {
				config: {
					posts_per_page: site.posts_per_page,
				},
				site,
				custom: theme,
				root,
			},
		};

		if (!this.templates.hasOwnProperty(templateName)) {
			throw new Error(`unknown template ${templateName}`);
		}

		const tree = layout_tree(templateName, this.templates);
		return tree.reduce((acc: string, name: string) => {
			this.context.body = new Handlebars.SafeString(acc);
			return this.hbs.render(
				this.templates[name].replace(LAYOUT_PATTERN, ''),
				this.context,
				this.runtimeOptions
			);
		}, '');
	}

	/* end public methods */
}

const thereCanOnlyBeOne = new WorkersCompatGhost();
export default thereCanOnlyBeOne;
export { layout_tree } from './utils/layout_tree';
