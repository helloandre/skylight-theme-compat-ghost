export default function slugify(str: string) {
	return str.toLocaleLowerCase().replace(/[^a-zA-Z0-9]+/g, '-');
}
