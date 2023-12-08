import { Button, PillsInput, Popover } from '@mantine/core';
import { useState } from 'react';
import { Field, RuleType, formatQuery, QueryBuilder, RuleGroupType } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';

const demoSchema = {
	fields: [
		{
			name: 'app_meta',
			data_type: 'Utf8',
			nullable: true,
			dict_id: 0,
			dict_is_ordered: false,
			metadata: {},
		},
		{
			name: 'device_id',
			data_type: 'Int64',
			nullable: true,
			dict_id: 0,
			dict_is_ordered: false,
			metadata: {},
		},
		{
			name: 'host',
			data_type: 'Utf8',
			nullable: true,
			dict_id: 0,
			dict_is_ordered: false,
			metadata: {},
		},
		{
			name: 'level',
			data_type: 'Utf8',
			nullable: true,
			dict_id: 0,
			dict_is_ordered: false,
			metadata: {},
		},
		{
			name: 'location',
			data_type: 'Utf8',
			nullable: true,
			dict_id: 0,
			dict_is_ordered: false,
			metadata: {},
		},
		{
			name: 'message',
			data_type: 'Utf8',
			nullable: true,
			dict_id: 0,
			dict_is_ordered: false,
			metadata: {},
		},
		{
			name: 'os',
			data_type: 'Utf8',
			nullable: true,
			dict_id: 0,
			dict_is_ordered: false,
			metadata: {},
		},
		{
			name: 'p_metadata',
			data_type: 'Utf8',
			nullable: true,
			dict_id: 0,
			dict_is_ordered: false,
			metadata: {},
		},
		{
			name: 'p_tags',
			data_type: 'Utf8',
			nullable: true,
			dict_id: 0,
			dict_is_ordered: false,
			metadata: {},
		},
		{
			name: 'p_timestamp',
			data_type: {
				Timestamp: ['Millisecond', null],
			},
			nullable: true,
			dict_id: 0,
			dict_is_ordered: false,
			metadata: {},
		},
		{
			name: 'process_id',
			data_type: 'Int64',
			nullable: true,
			dict_id: 0,
			dict_is_ordered: false,
			metadata: {},
		},
		{
			name: 'request_body',
			data_type: 'Utf8',
			nullable: true,
			dict_id: 0,
			dict_is_ordered: false,
			metadata: {},
		},
		{
			name: 'response_time',
			data_type: 'Int64',
			nullable: true,
			dict_id: 0,
			dict_is_ordered: false,
			metadata: {},
		},
		{
			name: 'runtime',
			data_type: 'Utf8',
			nullable: true,
			dict_id: 0,
			dict_is_ordered: false,
			metadata: {},
		},
		{
			name: 'session_id',
			data_type: 'Utf8',
			nullable: true,
			dict_id: 0,
			dict_is_ordered: false,
			metadata: {},
		},
		{
			name: 'source_time',
			data_type: 'Utf8',
			nullable: true,
			dict_id: 0,
			dict_is_ordered: false,
			metadata: {},
		},
		{
			name: 'status_code',
			data_type: 'Int64',
			nullable: true,
			dict_id: 0,
			dict_is_ordered: false,
			metadata: {},
		},
		{
			name: 'timezone',
			data_type: 'Utf8',
			nullable: true,
			dict_id: 0,
			dict_is_ordered: false,
			metadata: {},
		},
		{
			name: 'user_agent',
			data_type: 'Utf8',
			nullable: true,
			dict_id: 0,
			dict_is_ordered: false,
			metadata: {},
		},
		{
			name: 'user_id',
			data_type: 'Int64',
			nullable: true,
			dict_id: 0,
			dict_is_ordered: false,
			metadata: {},
		},
		{
			name: 'uuid',
			data_type: 'Utf8',
			nullable: true,
			dict_id: 0,
			dict_is_ordered: false,
			metadata: {},
		},
		{
			name: 'version',
			data_type: 'Utf8',
			nullable: true,
			dict_id: 0,
			dict_is_ordered: false,
			metadata: {},
		},
	],
	metadata: {},
};

export const validator = (r: RuleType) => !!r.value;

type FilterBoxProps = {
	setQuery: (q: string) => void;
	streamName: string | null;
};
const FilterBox = ({ setQuery: setMainContextQuery, streamName }: FilterBoxProps) => {
	const [query, setQuery] = useState<RuleGroupType>({
		combinator: 'and',
		rules: [
			{ field: 'device_id', operator: '=', value: 4000 },
			{ field: 'level', operator: '=', value: 'info' },
		],
	});
	const [isModalOpen, setIsModalOpen] = useState(false);

	const parseType = (type: any) => {
		if (typeof type === 'object') {
			return 'datetime-local';
		}
		switch (type) {
			case 'Int64':
				return 'number';
			case 'Utf8':
				return 'text';
			default:
				return 'text';
		}
	};
	const fields: Field[] = demoSchema.fields.map((field) => ({
		name: field.name,
		label: field.name,
		inputType: parseType(field.data_type),
		validator,
	}));

	const onApply = () => {
		const queryStart = `SELECT * FROM ${streamName} WHERE `;
		// setMainContextQuery(formatQuery(query, 'sql'));
		setMainContextQuery(queryStart + formatQuery(query, 'sql'));
		setIsModalOpen(false);
	};

	return (
		<Popover opened={isModalOpen}>
			<Popover.Target>
				<PillsInput
					w={'100%'}
					onClick={() => {
						setIsModalOpen(true);
					}}
				/>
			</Popover.Target>
			<Popover.Dropdown>
				<QueryBuilder
					fields={fields}
					controlClassnames={{ queryBuilder: 'queryBuilder-branches' }}
					query={query}
					onQueryChange={(q) => setQuery(q)}
				/>
				<h4>
					SQL as result of <code>formatQuery(query, 'sql')</code>:
				</h4>
				<pre>{formatQuery(query, 'sql')}</pre>
				<Button onClick={() => setIsModalOpen(false)}>Close</Button>
				<Button ml={'md'} onClick={onApply}>
					Apply
				</Button>
			</Popover.Dropdown>
		</Popover>
	);
};

export default FilterBox;
