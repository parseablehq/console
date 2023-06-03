import { Field } from '../dataType';

export type LogStreamData = Array<{ name: string }>;

export type LogStreamSchemaData = {
	fields: Array<Field>;
	metadata: Record<string, string>;
};

export type LogsData = Array<{
	p_timestamp: string;
	p_metadata: string;
	p_tags: string;
	[key: string]: string | number | null | Date;
}>;
