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
		lifetime_count: number;
		lifetime_size: string;
		deleted_count: number;
		deleted_size: string;
	};
	storage: {
		format: string;
		size: string;
		lifetime_size: string;
		deleted_size: string;
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
	"created-at": string;
	"first-event-at": string;
	cache_enabled: boolean;
	time_partition: string;
	static_schema_flag: boolean;
}

export type LogStreamRetention = Array<action>;
