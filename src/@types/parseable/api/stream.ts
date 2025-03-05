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
		size: number;
		lifetime_count: number;
		lifetime_size: number;
		deleted_count: number;
		deleted_size: number;
	};
	storage: {
		format: string;
		size: number;
		lifetime_size: number;
		deleted_size: number;
	};
	stream: string;
	time: string;
};

export type action = {
	description: string;
	action: string;
	duration: string;
};

export type StreamInfo = {
	'created-at': string;
	'first-event-at': string;
	time_partition: string;
	static_schema_flag: boolean;
	time_partition_limit: string;
	custom_partition: string;
	stream_type: 'UserDefined' | 'Internal';
};

export type LogStreamRetention = Array<action>;

export type HotTierConfig =
	| {
			size: string;
			used_size: string;
			available_size: string;
			oldest_date_time_entry: string;
	  }
	| object;

export type UpdateHotTierConfig = {
	size: string;
};
