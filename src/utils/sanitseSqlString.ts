import { notify } from './notification';

export const sanitseSqlString = (sqlString: string): string => {
	const withoutComments = sqlString.replace(/--.*$/gm, '');
	const withoutNewLines = withoutComments.replace(/\n/g, ' ');
	const withoutTrailingSemicolon = withoutNewLines.replace(/;/, '');
	const limitRegex = /limit\s+(\d+)/i;
	if (!limitRegex.test(withoutTrailingSemicolon)) {
		notify({ message: 'default limit used i.e - 1000' });
		return `${withoutTrailingSemicolon.trim()} LIMIT 1000`;
	}
	return withoutTrailingSemicolon;
};
