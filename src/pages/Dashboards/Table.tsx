import { ScrollArea, Stack, Table, Text } from '@mantine/core';
import { TickConfig, TileQueryResponse, UnitType } from '@/@types/parseable/api/dashboards';
import classes from './styles/Table.module.css';
import _ from 'lodash';
import { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { tickFormatter } from './utils';

const makeRowData = (data: TileQueryResponse, fieldUnitMap: Record<string, UnitType>) => {
	const { fields, records } = data;
	return _.map(records, (rec) => {
		return _.chain(rec)
			.thru((rec) => {
				return _.map(fields, (field) => {
					const colValue = _.get(rec, field, '-');
					return tickFormatter(colValue, fieldUnitMap[field]);
				});
			})
			.value();
	});
};

const NoDataView = () => {
	return (
		<Stack style={{ alignItems: 'center', justifyContent: 'center', flex: 1, gap: 0 }}>
			<IconAlertTriangle stroke={1.2} className={classes.warningIcon} />
			<Text className={classes.warningText}>No data to display</Text>
		</Stack>
	);
};

const makeFieldUnitMap = (tick_config: TickConfig[]) => {
	return _.reduce(
		tick_config,
		(acc, config) => {
			return { ...acc, [config.key]: config.unit };
		},
		{},
	);
};

const TableViz = (props: { data: TileQueryResponse; tick_config: TickConfig[] }) => {
	const {
		data: { fields, records },
		tick_config,
	} = props;
	const fieldUnitMap = useMemo(() => makeFieldUnitMap(tick_config), [fields]);
	const rowData = useMemo(() => makeRowData({ fields, records }, fieldUnitMap), [records]);

	const containerRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
	const [initialHeight, setInitialHeight] = useState(0);

	useEffect(() => {
		if (containerRef.current) {
			setInitialHeight(containerRef.current.offsetHeight);
		}
	}, []);
	const hasNoData = _.isEmpty(records) || _.isEmpty(fields);

	return (
		<Stack ref={containerRef} style={{ flex: 1, width: '100%' }}>
			<Stack style={{ height: initialHeight }}>
				{hasNoData ? (
					<NoDataView />
				) : (
					<ScrollArea>
						<Table
							striped
							highlightOnHover
							stickyHeader
							classNames={{ thead: classes.thead, tbody: classes.tbody, table: classes.table }}
							data={{
								head: fields,
								body: rowData,
							}}
						/>
					</ScrollArea>
				)}
			</Stack>
		</Stack>
	);
};

export default TableViz;
