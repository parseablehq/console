export type Correlation = {
	version: string;
	id: string;
	title: string;
	tableConfigs: Array<{
		selectedFields: string[];
		tableName: string;
	}>;
	joinConfig: {
		joinConditions: Array<{
			tableName: string;
			field: string;
		}>;
	};
	filter: null;
	startTime: string;
	endTime: string;
};
