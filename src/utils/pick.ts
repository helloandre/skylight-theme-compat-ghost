export default function pick(obj: any, paths: string[]) {
	// if (Array.isArray(paths[0])) {
	// 	paths = paths[0];
	// }

	if (obj == null) {
		return {};
	}

	return paths.reduce((acc: any, path: string) => {
		acc[path] = obj[path];
		return acc;
	}, {});
}
