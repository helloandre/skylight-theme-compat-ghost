import { SafeString } from 'workers-hbs';

export default function concat(...args: any) {
	const options = args.pop();
	const separator = options.hash.separator || '';

	return new SafeString(args.join(separator));
}
