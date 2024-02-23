import { notify } from './notification';
import { LOAD_LIMIT } from '@/pages/Logs/context';

export const sanitiseSqlString = (sqlString: string): string => {
	const withoutComments = sqlString.replace(/--.*$/gm, '');
	const withoutNewLines = withoutComments.replace(/\n/g, ' ');
	const withoutTrailingSemicolon = withoutNewLines.replace(/;/, '');
	const limitRegex = /limit\s+(\d+)/i;
	if (!limitRegex.test(withoutTrailingSemicolon)) {
		notify({ message: `Default limit used i.e - ${LOAD_LIMIT}` });
		return `${withoutTrailingSemicolon.trim()} LIMIT ${LOAD_LIMIT}`;
	}
	return withoutTrailingSemicolon;
};
