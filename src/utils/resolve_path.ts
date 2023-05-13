// we get this from requiring that this be executed with
// wrangler's config of "node_compat = true"
// @ts-ignore-next
import path from 'path';

export default function resolvePath(template: string, layout?: string) {
	return layout && layout.startsWith('.') ? path.resolve(template, layout) : layout;
}
