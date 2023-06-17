export default function visible(items: any, visibility: string | string[]) {
	const isArr = Array.isArray(items);
	const visArray = Array.isArray(visibility)
		? visibility
		: visibility.split(',').map(x => x.trim());

	// Fallback behaviour for items that don't have visibility set on them
	const defaultVisibility = 'public';
	const returnByDefault = visArray.includes(defaultVisibility);

	// We don't want to change the structure of what is returned
	return items.reduce(
		(accumulator: { [idx: string]: any }, item: any, key: string) => {
			// If the item has visibility, check to see if it matches, else if there's no visibility check for a match with the default visibility
			if (
				visArray.includes('all') ||
				(item.visibility && visArray.includes(item.visibility)) ||
				(!item.visibility && returnByDefault)
			) {
				if (isArr) {
					accumulator.push(item);
				} else {
					accumulator[key] = item;
				}
			}
			return accumulator;
		},
		isArr ? [] : {}
	);
}
