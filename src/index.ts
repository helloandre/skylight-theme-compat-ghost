// @ts-ignore-next
import { HelperDelegate } from 'handlebars';
import hbs, { RenderVisitor } from 'workers-hbs';
import resolvePath from './utils/resolve_path';
import { SITE, SAFE_VERSION } from './defaults';
import globalSettings from './global_settings';
import { clean } from './utils/links';

// helpers
import asset from './helpers/asset';
import body_class from './helpers/body_class';
import concat from './helpers/concat';
import date from './helpers/date';
import foreach from './helpers/foreach';
import ghost_head from './helpers/ghost_head';
import img_url from './helpers/img_url';
import link_class from './helpers/link_class';
import match from './helpers/match';
import meta_title from './helpers/meta_title';
import navigation from './helpers/navigation';
import pagination from './helpers/pagination';
import page_url from './helpers/page_url';

const HELPERS: { [idx: string]: HelperDelegate } = {
	asset,
	body_class,
	concat,
	date,
	foreach,
	ghost_head,
	img_url,
	link_class,
	match,
	meta_title,
	navigation,
	pagination,
	page_url,
};

export type TemplatesObj = {
	index: string;
	post: string;
	[idx: string]: string;
};
export type PartialsObj = {
	[idx: string]: string;
};

export type Post = {
	id: string;
	title: string;
	slug: string;
	html: string;
	feature_image?: string;
	featured: boolean;
	type: 'page' | 'post';
	status: 'draft' | 'scheduled' | 'published';
	locale?: string;
	visibility: 'public' | 'hidden';
	created_at: string;
	created_by: number;
	updated_at: string;
	updated_by: number;
	published_at?: string;
	published_by?: number;
	custom_excerpt?: string;
	codeinjection_head?: string;
	codeinjection_foot?: string;
	custom_template?: string;
	canonical_url?: string;
};

// @see https://ghost.org/docs/config/
export type PackageSettings = {
	url: string;
	assetHash: string; // hash to use for versioning of assets
	// database	In production	Type of database used (default: MySQL)
	// mail	In production	Add a mail service
	admin?: { url: string }; // Optional	Set the protocol and hostname for your admin panel
	// server?: string;	// Optional	Host and portqq for Ghost to listen on
	privacy?: {
		useTinfoil: boolean;
		useUpdateCheck: boolean;
		useGravatar: boolean;
		useRpcPing: boolean;
		useStructuredData: boolean;
	}; //	Optional	// Disable features set in privacy.md
	paths?: {
		contentPath: string;
	}; //	Optional	Customise internal paths
	referrerPolicy?: string; //	Optional	Control the content attribute of the meta referrer tag
	useMinFiles?: boolean; //	Optional	Generate assets url with .min notation
	adapters?: any;
	storage?: any; //	Optional	Set a custom storage adapter
	scheduling?: any; //	Optional	Set a custom scheduling adapter
	logging?: any; //	Optional	Configure logging for Ghost
	spam?: any; //	Optional	Configure spam settings
	caching?: any; //	Optional	Configure HTTP caching settings
	compress?: boolean; //	Optional	Disable compression of server responses
	imageOptimization?: {
		resize: boolean;
	}; // Optional	Configure image manipulation and processing
	// opensea	Optional	Increase rate limit for fetching NFT embeds from OpenSea.io
	// tenor	Optional	Enable integration with Tenor.com for embedding GIFs directly from the editor
	twitter?: {
		privateReadOnlyToken: string;
	}; // Optional	Add support for rich twitter embeds in newsletters
	portal?: {
		url: string | false;
	}; //	Optional	Relocate or remove the scripts for Portal
	sodoSearch?: {
		url: string | false;
		styles?: string;
	}; // Optional	Relocate or remove the scripts for Sodo search
	comments?: {
		url: string | false;
		styles?: string;
	};
};

// @see https://ghost.org/docs/themes/helpers/site/
// accessable via @site
export type SiteSettings = {
	accent_color?: string;
	cover_image?: string;
	description?: string;
	facebook?: string;
	icon?: string;
	locale?: string;
	logo?: string;
	navigation?: string;
	posts_per_page?: string;
	signup_url?: string;
	timezone?: string;
	title?: string;
	twitter?: string;
	url?: string; // generated
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

// @see https://ghost.org/docs/themes/helpers/config/
// accessable via @config
type ConfigSettings = {
	pages_per_post?: number;
};

// @see https://ghost.org/docs/themes/helpers/custom/
// @see https://ghost.org/docs/themes/custom-settings/
// accessable via @custom
export type CustomThemeSettings = {
	[idx: string]: any;
};

type GhostSettings = {
	// @TODO
	//  labs: {},
	package: PackageSettings;
	site: SiteSettings;
	custom: CustomThemeSettings;
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

/**
 * Regex pattern for layout directive. {{!< layout }}
 */
const LAYOUT_PATTERN = /{{!<\s+([A-Za-z0-9\._\-\/]+)\s*}}/;

export class WorkersCompatGhost {
	hbs: RenderVisitor;
	// we know this is empty, this is checked later
	// @ts-ignore-next
	private templates: TemplatesObj;
	// @ts-ignore-next
	private settings: GhostSettings;
	// passed to workers-hbs render
	private context: any = {};
	private runtimeOptions: any = {};

	constructor() {
		this.hbs = new hbs();

		Object.keys(HELPERS).forEach(key => {
			this.hbs.registerHelper(key, HELPERS[key].bind(this));
		});
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
	 */
	withConfig(pkg: PackageSettings, site: SiteSettings, custom: CustomThemeSettings) {
		if (pkg.admin) {
			pkg.admin.url = clean(pkg.admin?.url);
		}
		site.url = clean(pkg.url);
		this.settings = {
			site,
			package: pkg,
			custom,
		};

		globalSettings.init({
			...site,
			...pkg,
			...custom,
			subdir: new URL(site.url).pathname.replace(/\/$/, ''),
		});

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
		// @TODO figure out exactly what needs to be .init()'d in config

		// @TODO add things from the Ghost Context (like post, etc)
		this.context = {
			meta_title: this.settings.site.meta_title,
			...root,
		};

		this.runtimeOptions = {
			// available via @-variables
			data: {
				config: {
					posts_per_page: this.settings.site.posts_per_page,
				},
				site: {
					...SITE,
					...this.settings.site,
				},
				// @TODO support custom settings
				// with actual proper package.custom settings
				custom: this.settings.custom,
				_locals: {
					...root,
					safeVersion: SAFE_VERSION,
				},
			},
		};

		return this.renderLayout(templateName);
	}

	/* end public methods */

	/* begin private methods */
	private renderLayout(templateName: keyof TemplatesObj, child?: string): string {
		if (!this.templates.hasOwnProperty(templateName)) {
			throw new Error(`unknown template ${templateName}`);
		}

		if (child) {
			this.context.body = child;
		} else {
			this.context.body = '';
		}

		let templateStr = this.templates[templateName];

		const matches = templateStr.match(LAYOUT_PATTERN);
		// we have to go a level higher into a parent template
		if (matches) {
			return this.renderLayout(
				resolvePath(templateName as string, matches[1]),
				this.hbs.render(templateStr.replace(LAYOUT_PATTERN, ''), this.context, this.runtimeOptions)
			);
		}

		return this.hbs.render(templateStr, this.context, this.runtimeOptions);
	}
}

const thereCanOnlyBeOne = new WorkersCompatGhost();
export default thereCanOnlyBeOne;
