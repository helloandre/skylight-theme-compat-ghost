/**
 * I hate this, but ghost does a bunch of global config shenanigans
 * so we have to have this global config as well
 *
 * @see https://ghost.org/docs/themes/custom-settings/
 */

let CONFIG: { [idx: string]: any } = {};
const globalConfig = {
	init: function (conf: any) {
		CONFIG = conf;
	},
	get: function (key: string) {
		return CONFIG[key];
	},
};

export default globalConfig;
