import { Stack, Table, Text } from "@mantine/core"
import { Tile } from "./providers/DashboardsProvider";
import { TileQueryResponse } from "@/@types/parseable/api/dashboards";
import classes from './styles/Table.module.css'
import _ from "lodash";
import { useEffect, useRef, useState } from "react";

const makeRowData = (data: TileQueryResponse) => {
    const {fields, records} = data;
    return _.map(records, rec => {
        return _.at(rec, fields);
    })
}

const TableViz = (props: { tile: Tile; data: TileQueryResponse }) => {
	const {
		tile,
		data: { fields, records },
	} = props;
	const rowData = makeRowData({ fields, records });

	const containerRef = useRef(null);
	const [initialHeight, setInitialHeight] = useState(0);

	useEffect(() => {
		if (containerRef.current) {
			setInitialHeight(containerRef.current.offsetHeight);
		}
	}, []);

	return (
		<Stack ref={containerRef} style={{ flex: 1, width: '100%', overflow: 'auto' }}>
			<Stack style={{ overflow: 'scroll', height: initialHeight }}>
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
			</Stack>
		</Stack>
	);
};

export default TableViz;