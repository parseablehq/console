import { Badge, Button, Checkbox, Group, Popover, ScrollArea } from '@mantine/core';
import { Dispatch, ReactNode, SetStateAction, useEffect } from 'react';
import { Field, RuleType, formatQuery, QueryBuilder, RuleGroupType, parseSQL } from 'react-querybuilder';
import { QueryBuilderMantine } from '@react-querybuilder/mantine';

import 'react-querybuilder/dist/query-builder.css';
import { useQueryPageContext } from './Context';
import useMountedState from '@/hooks/useMountedState';

export const validator = (r: RuleType) => !!r.value;

type FilterBoxProps = {
	setQuery: (q: string) => void;
	streamName: string | null;
	query: string;
};
const FilterBox = ({ setQuery: setMainContextQuery, streamName, query: mainContextQuery }: FilterBoxProps) => {
	const {
		state: { subSchemaList },
	} = useQueryPageContext();
	const [fields, setFields] = useMountedState<Field[]>([]);
	const [selectedFields, setSelectedFields] = useMountedState<Field[]>([]);
	const [checkBoxFields, setCheckBoxFields] = useMountedState<Field[]>([]);

	const [query, setQuery] = useMountedState<RuleGroupType>({
		combinator: 'and',
		rules: [],
	});
	const [isModalOpen, setIsModalOpen] = useMountedState(false);

	useEffect(() => {
		const schemaListener = subSchemaList.subscribe((schemaRes) => {
			if (schemaRes) {
				const fields: Field[] = schemaRes.fields.map((field) => ({
					name: field.name,
					label: field.name,
					inputType: parseType(field.data_type),
					validator,
				}));
				setCheckBoxFields(fields);
				setFields(fields);
				setSelectedFields(fields);
			}
		});

		return () => {
			schemaListener();
		};
	}, []);

	useEffect(() => {
		if (mainContextQuery) {
			parseSelectField(mainContextQuery);
			try {
				const parsedQuery = parseSQL(mainContextQuery);
				setQuery(parsedQuery);
			} catch {
				console.log('Query Cannot be parsed');
			}
		}
	}, [mainContextQuery]);

	const parseSelectField = (mainContextQuery: string) => {
		const parsedSelectedField = mainContextQuery
			.split('SELECT')[1]
			.split('FROM')[0]
			.split(',')
			.map((field) => field.trim());
		const selectedFields = fields.filter((field) => parsedSelectedField.includes(field.name));
		if (selectedFields.length) {
			setSelectedFields(selectedFields);
			setCheckBoxFields(fields);
		} else if (mainContextQuery.split('SELECT')[1].split('FROM')[0].trim() === '*') {
			setSelectedFields(fields);
			setCheckBoxFields(fields);
		} else {
			console.log('Custom Query', query);
			const customQuery = {
				name: mainContextQuery.split('SELECT')[1].split('FROM')[0],
				label: mainContextQuery.split('SELECT')[1].split('FROM')[0],
			};
			setSelectedFields([customQuery]);
			setCheckBoxFields([customQuery, ...fields]);
		}
	};

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

	const GenerateQueryStart = (streamName: string, selectedFields: Field[], fields?: Field[]) => {
		if (fields && fields.length === selectedFields.length) {
			return `SELECT * FROM ${streamName} WHERE `;
		} else {
			return `SELECT ${selectedFields.map((field) => field.name).join(',')} FROM ${streamName} WHERE `;
		}
	};

	const onApply = () => {
		const queryStart = GenerateQueryStart(streamName!, selectedFields, fields);
		setMainContextQuery(queryStart + formatQuery(query, 'sql') + ` LIMIT 1000;`);
		setIsModalOpen(false);
	};

	return (
		<Popover opened={isModalOpen}>
			<Popover.Target>
				<Button
					variant="outline"
					ml={'sm'}
					onClick={() => {
						setIsModalOpen((prev) => !prev);
					}}
					h={'100%'}
					>
					<FieldsPillList query={query} setQuery={setQuery} setIsModalOpen={setIsModalOpen} />
				</Button>
			</Popover.Target>

			<Popover.Dropdown>
				<FieldSelection selectedFields={selectedFields} setSelectedFields={setSelectedFields} fields={checkBoxFields} />
				<QueryBuilderMantine>
					<QueryBuilder
						fields={fields}
						controlClassnames={{ queryBuilder: 'queryBuilder-branches' }}
						query={query}
						onQueryChange={(q) => setQuery(q)}
					/>
				</QueryBuilderMantine>

				<Button m={'md'} onClick={() => setIsModalOpen(false)}>
					Close
				</Button>
				<Button m={'md'} onClick={onApply}>
					Apply
				</Button>
			</Popover.Dropdown>
		</Popover>
	);
};

type fieldsPillListProps = {
	query: RuleGroupType;
	setQuery: Dispatch<SetStateAction<RuleGroupType>>;
	setIsModalOpen: Dispatch<SetStateAction<boolean>>;
};

const FieldsPillList = ({ query }: fieldsPillListProps) => {
	const set = (rg: RuleGroupType, padding: number) => {
		const rules = rg.rules.map((rule): ReactNode => {
			if ('field' in rule) {
				return (
					<Badge variant="outline" color="blue" ml={'xs'} radius="lg">
						{rule.field} {rule.operator} {rule.value}
					</Badge>
				);
			}
		});

		const groups = rg.rules.map((rule): ReactNode => {
			if ('rules' in rule) {
				return set(rule, padding - 2);
			}
		});

		return (
			<Badge variant="outline" p={padding} radius="xs">
				{rg.combinator} {rules} {groups}
			</Badge>
		);
	};

	return <Group>{set(query, 13)}</Group>;
};

type FieldSelectionProps = {
	selectedFields: Field[];
	setSelectedFields: Dispatch<SetStateAction<Field[]>>;
	fields: Field[];
};

const FieldSelection = ({ selectedFields, setSelectedFields, fields }: FieldSelectionProps) => {
	return (
		<ScrollArea h={'400px'}>
			{fields.map((field) => (
				<Checkbox
					mb={'md'}
					key={field.name}
					label={field.name}
					checked={selectedFields.includes(field)}
					onChange={(e) => {
						if (e.target.checked) {
							setSelectedFields([...selectedFields, field]);
						} else {
							setSelectedFields(selectedFields.filter((ele) => ele !== field));
						}
					}}
				/>
			))}
		</ScrollArea>
	);
};

export default FilterBox;
