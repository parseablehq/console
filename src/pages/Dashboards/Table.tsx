import { Stack, Table, Text } from "@mantine/core"
import { TileQueryResponse } from "@/@types/parseable/api/dashboards";
import classes from './styles/Table.module.css'
import _ from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";

const makeRowData = (data: TileQueryResponse) => {
    const {fields, records} = data;
    return _.map(records, rec => {
        return _.at(rec, fields);
    })
}

const NoDataView = () => {
	return (
		<Stack style={{ alignItems: 'center', justifyContent: 'center', flex: 1, gap: 0 }}>
			<IconAlertTriangle stroke={1.2} className={classes.warningIcon} />
			<Text className={classes.warningText}>No data to display</Text>
		</Stack>
	);
};

const TableViz = (props: { data: TileQueryResponse }) => {
	const {
		data: { fields, records },
	} = props;
	// debug
	const rowData = useMemo(() => makeRowData({ fields, records }), []);

	const containerRef = useRef(null);
	const [initialHeight, setInitialHeight] = useState(0);

	useEffect(() => {
		if (containerRef.current) {
			setInitialHeight(containerRef.current.offsetHeight);
		}
	}, []);
	const hasNoData = _.isEmpty(records) || _.isEmpty(fields)

	return (
		<Stack ref={containerRef} style={{ flex: 1, width: '100%', overflow: 'auto' }}>
			<Stack style={{ overflow: 'scroll', height: initialHeight }}>
				{hasNoData ? (
					<NoDataView />
				) : (
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
				)}
			</Stack>
		</Stack>
	);
};

export default TableViz;