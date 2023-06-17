export default function getOgType(context: string[]) {
	context = context ?? [];

	if (context.includes('amp') || context.includes('post')) {
		return 'article';
	}

	if (context.includes('author')) {
		return 'profile';
	}

	return 'website';
}
