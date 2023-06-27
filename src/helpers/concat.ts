import { Handlebars } from 'workers-hbs';
import { WorkersCompatGhost } from '..';

export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper('concat', function (...args: any) {
		const options = args.pop();
		const separator = options.hash.separator || '';

		return new Handlebars.SafeString(args.join(separator));
	});
}
