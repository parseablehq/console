import { Field } from '../dataType';

export type LogStreamData = Array<{ name: string }>;

export type LogStreamSchemaData = {
	fields: Array<Field>;
	metadata: Record<string, string>;
};
export type LogStreamStat = {
	ingestion: {
		count: number;
		format: string;
		size: string;
	};
	storage: {
		format: string;
		size: string;
	};
	stream: string;
	time: string;
};

export type action = {
	description: string;
	action: string;
	duration: string;
};

export type LogStreamRetention = Array<action>;
