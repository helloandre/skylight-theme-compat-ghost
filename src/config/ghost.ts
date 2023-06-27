import { init as baseinit, get as baseget } from '.';

/**
 * these options and behaviors come from what would be in a config.production.json configuration
 *
 * @see https://ghost.org/docs/config/#configuration-options
 */

type CustomAdaptorConfiguration = {
	active: string;
	[idx: string]: any;
};

export type GhostConfiguration = {
	url: string;
	// subdir: // calculated
	// database: // unused
	// mail: any; // @TODO
	admin?: {
		url?: string;
		redirects?: boolean;
	};
	// server: // unused
	// @see https://ghost.org/docs/config/#privacy
	privacy?: {
		useTinfoil: boolean;
		useUpdateCheck: boolean;
		useGravatar: boolean;
		useRpcPing: boolean;
		useStructuredData: boolean;
	};
	paths?: {
		contentPath?: string;
		assetSrc?: string;
	};
	referrerPolicy?: string;
	useMinFiles?: boolean;
	// @see https://ghost.org/docs/config/#storage-adapters
	storage?: CustomAdaptorConfiguration;
	scheduling?: CustomAdaptorConfiguration;
	logging?: {
		// "path": // unused
		useLocalTime?: boolean;
		level?: 'info' | 'warn' | 'error';
		// "rotation": // unused
		// "transports": // unused
	};
	// @see https://ghost.org/docs/config/#spam
	// it is recommended to use Cloudflare Firewall Rules for this instead
	// spam: // unused
	caching?: {
		'frontend'?: {
			maxAge: number;
		};
		'301'?: {
			maxAge: number;
		};
		'customRedirects'?: {
			maxAge: number;
		};
		'favicon'?: {
			maxAge: number;
		};
		'sitemap'?: {
			maxAge: number;
		};
		'robotstxt'?: {
			maxAge: number;
		};
		'cors'?: {
			maxAge: number;
		};
	};
	compress?: boolean;
	imageOptimization?: {
		resize: boolean;
	};
	// opensea: // unsupported
	// tenor: // unsupported
	// twitter: // unsupported
	// portal: // unsupported
	// sodoSearch: // unsupported
	// comments: // TODO
	adapters?: {
		sso?: { [idx: string]: any };
		storage?: { [idx: string]: any };
		caching?: { [idx: string]: any };
		scheduling?: { [idx: string]: any };
	};
	// any additional defaults
	[idx: string]: any;
};

export const DEFAULTS: GhostConfiguration = {
	url: 'http://localhost:8788', // default port of miniflare
	admin: {
		redirects: true,
	},
	useMinFiles: true,
	paths: {
		contentPath: 'content',
		assetSrc: 'core/frontend/src',
	},
	adapters: {
		sso: {
			active: 'Default',
		},
	},
	storage: {
		active: 'LocalImagesStorage',
		media: 'LocalMediaStorage',
		files: 'LocalFilesStorage',
		LocalMediaStorage: {},
		LocalFilesStorage: {},
	},
	scheduling: {
		active: 'SchedulingDefault',
	},
	members: {
		contentApiAccess: [],
		paymentProcessors: [],
		emailTemplate: {
			showSiteHeader: true,
			showPoweredBy: true,
		},
	},
	logging: {
		level: 'info',
	},
	caching: {
		'frontend': {
			maxAge: 0,
		},
		'301': {
			maxAge: 31536000,
		},
		'customRedirects': {
			maxAge: 31536000,
		},
		'favicon': {
			maxAge: 86400,
		},
		'sitemap': {
			maxAge: 3600,
		},
		'robotstxt': {
			maxAge: 3600000,
		},
		'cors': {
			maxAge: 86400,
		},
	},
	imageOptimization: {
		resize: true,
	},
	compress: true,
	preloadHeaders: false,
	adminFrameProtection: true,
	sendWelcomeEmail: true,
	stripeDirect: false,
	enableStripePromoCodes: false,
	emailAnalytics: true,
	backgroundJobs: {
		emailAnalytics: true,
	},
	editor: {
		url: '',
	},
	gravatar: {
		url: 'https://www.gravatar.com/avatar/{hash}?s={size}&r={rating}&d={_default}',
	},
	// comments: {
	// 	url: 'https://unpkg.com/@tryghost/comments-ui@~0.1.0/umd/comments-ui.min.js',
	// 	version: '0.1.0',
	// },
};

export function init(config: GhostConfiguration) {
	if (!config.admin) {
		config.admin = {
			url: config.url,
		};
	}

	config.subdir = new URL(config.url).pathname.replace(/\/$/, '');

	baseinit('ghost', config, DEFAULTS);
}

export function ghost(path?: string) {
	return baseget('ghost', path);
}

export function privacyDisabled(value: string) {
	const p = ghost('privacy') as GhostConfiguration['privacy'];

	if (!p) {
		return false;
	}

	if (p.useTinfoil) {
		return true;
	}

	if (p.hasOwnProperty(value)) {
		return p[value as keyof GhostConfiguration['privacy']];
	}

	return false;
}
