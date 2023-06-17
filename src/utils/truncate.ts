import th from 'truncate-html';

export default function truncate(text: string, options: { words?: string; characters?: string }) {
	const byCharacters = options.hasOwnProperty('characters');
	const byWords = !byCharacters || options.hasOwnProperty('words');

	const length = byCharacters
		? // @ts-ignore
		  parseInt(options.characters, 10)
		: options.hasOwnProperty('words')
		? // @ts-ignore
		  parseInt(options.words, 10)
		: 50;

	return th(text, length, { byWords });
}
