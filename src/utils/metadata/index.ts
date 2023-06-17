import { ghost } from '../../config/ghost';
import { site } from '../../config/site';
import getOgType from './og_type';

type GhostMetadataBase = {
	url: string;
	canonicalUrl: string;
	// ampUrl: getAmpUrl(data),
	previousUrl?: string;
	nextUrl?: string;
	authorUrl?: string;
	authorName?: string;
	rssUrl: string;
	metaTitle: string;
	metaDescription: string;
	excerpt?: string;
	coverImage?: {
		url: string;
	};
	authorImage?: {
		url: string;
	};
	ogImage?: {
		url: string;
	};
	ogTitle: string;
	ogDescription: string;
	twitterImage?: string;
	twitterTitle?: string;
	twitterDescription?: string;
	authorFacebook?: string;
	creatorTwitter?: string;
	keywords?: string[];
	publishedDate?: string;
	modifiedDate?: string;
	ogType: string;
	site: {
		title: string;
		description: string;
		url: string;
		facebook: string;
		twitter: string;
		timezone: string;
		navigation: string;
		icon: string;
		cover_image: string;
		logo: string;
		amp: string;
	};
	schema?: any;
};

export type GhostMetadata = GhostMetadataBase & {
	structuredData: {
		'og:site_name': string;
		'og:type': string;
		'og:title': string;
		'og:description': string;
		'og:url'?: string;
		'og:image'?: string;
		'article:published_time'?: string;
		'article:modified_time'?: string;
		'article:tag'?: string[];
		'article:publisher'?: string;
		'article:author'?: string;
		'twitter:card'?: string;
		'twitter:title'?: string;
		'twitter:description'?: string;
		'twitter:url': string;
		'twitter:image'?: string;
		'twitter:label1'?: string;
		'twitter:data1'?: string;
		'twitter:label2'?: string;
		'twitter:data2'?: string;
		'twitter:site': string;
		'twitter:creator'?: string;
	};
};

export function metadata(data: any, context: string[]): GhostMetadata {
	const meta: GhostMetadataBase = {
		url: ghost('url'),
		canonicalUrl: ghost('url'),
		metaTitle: site('title'),
		metaDescription: site('description'),
		rssUrl: '/rss',
		ogType: getOgType(context),
		ogTitle: site('title'),
		ogDescription: site('description'),
		authorName: data.post?.primary_author?.name,
		site: {
			title: site('title'),
			description: site('description'),
			url: ghost('url'),
			facebook: '',
			twitter: '',
			timezone: '',
			navigation: '',
			icon: '',
			cover_image: '',
			logo: '',
			amp: '',
		},
	};

	return {
		...meta,
		structuredData: {
			'og:site_name': meta.site.title,
			'og:type': meta.ogType,
			'og:title': meta.ogTitle,
			'og:description': meta.ogDescription,
			'og:url': meta.canonicalUrl,
			'og:image': meta.ogImage?.url || meta.coverImage?.url,
			'article:published_time': meta.publishedDate,
			'article:modified_time': meta.modifiedDate,
			'article:tag': meta.keywords,
			// 'article:publisher': meta.site.facebook ? socialUrls.facebook(meta.site.facebook) : undefined,
			// 'article:author': meta.authorFacebook ? socialUrls.facebook(meta.authorFacebook) : undefined,
			'twitter:card': meta.twitterImage || meta.coverImage?.url ? 'summary_large_image' : 'summary',
			'twitter:title': meta.twitterTitle,
			'twitter:description': meta.twitterDescription,
			'twitter:url': meta.canonicalUrl,
			'twitter:image': meta.twitterImage || meta.coverImage?.url,
			'twitter:label1': meta.authorName ? 'Written by' : undefined,
			'twitter:data1': meta.authorName,
			'twitter:label2': meta.keywords ? 'Filed under' : undefined,
			'twitter:data2': meta.keywords ? meta.keywords.join(', ') : undefined,
			'twitter:site': meta.site.twitter,
			'twitter:creator': meta.creatorTwitter,
		},
	};
}
