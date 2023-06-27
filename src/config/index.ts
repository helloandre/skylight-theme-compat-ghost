import { merge, get as lget } from 'lodash-es';

const CONFIG: { [idx: string]: any } = {};

export function init(type: string, conf: any, defaults: any) {
	// YES IT'S BACKWARDS
	CONFIG[type] = merge(defaults, conf);
}

export function get(type: string, path?: string) {
	if (!CONFIG[type]) {
		throw new Error(`config ${type} is not init'd`);
	}

	return !path ? CONFIG[type] : lget(CONFIG[type], path);
}
