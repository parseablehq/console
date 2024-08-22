import { notify } from './notification';
import { LOAD_LIMIT } from '@/pages/Stream/providers/LogsProvider';

export const sanitiseSqlString = (
	sqlString: string,
	shouldNotify: boolean = true,
	limit: number = LOAD_LIMIT,
): string => {
	const withoutComments = sqlString.replace(/--.*$/gm, '');
	const withoutNewLines = withoutComments.replace(/\n/g, ' ');
	const withoutTrailingSemicolon = withoutNewLines.replace(/;/g, '').trim();
	const limitRegex = /limit\s+(\d+)/i;

	if (limitRegex.test(withoutTrailingSemicolon)) {
		return withoutTrailingSemicolon.replace(limitRegex, (match, p1) => {
			const currentLimit = parseInt(p1, 10);
			if (currentLimit > limit) {
				shouldNotify &&
					notify({ message: `Limit exceeds the default load limit. Replacing with default limit - ${limit}` });
				return `LIMIT ${limit}`;
			}
			return match;
		});
	}

	shouldNotify && notify({ message: `Default limit used i.e - ${limit}` });
	return `${withoutTrailingSemicolon} LIMIT ${limit}`;
};
