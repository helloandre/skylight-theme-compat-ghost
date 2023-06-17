import { merge, get as lget } from 'lodash-es';

const CONFIG: { [idx: string]: any } = {};

export function init(type: string, base: any, provided: any) {
	CONFIG[type] = merge(provided, base);
}

export function get(type: string, path?: string) {
	if (!CONFIG[type]) {
		throw new Error(`config ${type} is not init'd`);
	}

	return !path ? CONFIG[type] : lget(CONFIG[type], path);
}
