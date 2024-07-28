import jq from 'jq-web';
import _ from 'lodash';

const jqSearch = async (
	records: {
		[key: string]: any;
	},
	filter: string,
) => {
	const sanitizedJqCommand = filter.replace(/^jq\s*/, '');
	try {
		const result = await jq.json(records, sanitizedJqCommand);
		return _.isArray(result) ? (_.some(result, (r) => !_.isNull(r)) ? result : []) : [result];
	} catch (e) {
		console.log(e);
		return [];
	}
};

export default jqSearch;
