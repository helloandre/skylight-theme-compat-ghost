import resolvePath from './resolve_path';
import type { TemplatesObj } from '..';

/**
 * Regex pattern for layout directive. {{!< layout }}
 */
export const LAYOUT_PATTERN = /{{!<\s+([A-Za-z0-9\._\-\/]+)\s*}}/;

/**
 * Recursively figure out which parent templates are needed to render a template
 * returns in order of child-most -> parent-most
 */
export function layout_tree(
	name: keyof TemplatesObj,
	templates: TemplatesObj,
	path: string[] = []
): string[] {
	if (!templates.hasOwnProperty(name)) {
		throw new Error(`unknown template ${name}`);
	}

	path.push(name as string);
	const matches = templates[name].match(LAYOUT_PATTERN);
	// we have to go a level higher into a parent template
	if (matches) {
		return layout_tree(resolvePath(name as string, matches[1]), templates, path);
	} else {
		return path;
	}
}
