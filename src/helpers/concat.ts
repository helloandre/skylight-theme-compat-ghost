import { SafeString } from 'handlebars';
import { WorkersCompatGhost } from '..';

export default function (instance: WorkersCompatGhost) {
	instance.hbs.registerHelper('concat', function (...args: any) {
		const options = args.pop();
		const separator = options.hash.separator || '';

		return new SafeString(args.join(separator));
	});
}
