import jq from 'jq-web';
import _ from 'lodash';

const jqSearch = async (
	records: {
		[key: string]: any;
	},
	filter: string,
) => {
	try {
		const result = await jq.json(records, filter);
        console.log(result)
		return _.isArray(result) ? _.some(result, r => !_.isNull(r)) ? result : [] : [result];
	} catch (e) {
		console.log(e);
		return [];
	}
};

export default jqSearch;
