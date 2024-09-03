import { Box } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import EmptyBox from '@/components/Empty';
import FilterPills from '../../components/FilterPills';
import tableStyles from '../../styles/Logs.module.css';
import {
	LOGS_FOOTER_HEIGHT,
	PRIMARY_HEADER_HEIGHT,
	STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT,
	STREAM_SECONDARY_TOOLBAR_HRIGHT,
} from '@/constants/theme';
import { useLogsStore } from '../../providers/LogsProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import _ from 'lodash';
import Footer from './Footer';
import { ErrorView, LoadingView } from './LoadingViews';
import { MantineReactTable } from 'mantine-react-table';

const TableContainer = (props: { children: ReactNode }) => {
	return <Box className={tableStyles.container}>{props.children}</Box>;
};

const makeHeaderOpts = (headers: string[]) => {
	return _.reduce(
		headers,
		(acc, header) => {
			return [...acc, { accessorKey: header, header, grow: true }];
		},
		[],
	);
};

export const Example = () => {
	const columns = useMemo(
		() => [
			{
				accessorKey: 'firstName',
				header: 'First Name', //uses the default width from defaultColumn prop
			},
			{
				accessorKey: 'lastName',
				header: 'Last Name',
				enableResizing: false, //disable resizing for this column
			},
			{
				accessorKey: 'email',
				header: 'Email Address',
				size: 200, //increase the width of this column
			},
			{
				accessorKey: 'city',
				header: 'City',
				size: 120, //decrease the width of this column
			},
			{
				accessorKey: 'country',
				header: 'Country',
				size: 100, //decrease the width of this column
			},
		],
		[],
	);

	return (
		<MantineReactTable
			columns={columns}
			data={[
				{
					firstName: 'Dylan',
					lastName: 'Murray',
					email: 'dmurray@yopmail.com',
					city: 'East Daphne',
					country: 'USA',
				},
				{
					firstName: 'Raquel',
					lastName: 'Kohler',
					email: 'rkholer33@yopmail.com',
					city: 'Columbus',
					country: 'USA',
				},
				{
					firstName: 'Raquel',
					lastName: 'Kohler',
					email: 'rkholer33@yopmail.com',
					city: 'Columbus',
					country: 'USA',
				},
				{
					firstName: 'Raquel',
					lastName: 'Kohler',
					email: 'rkholer33@yopmail.com',
					city: 'Columbus',
					country: 'USA',
				},
				{
					firstName: 'Raquel',
					lastName: 'Kohler',
					email: 'rkholer33@yopmail.com',
					city: 'Columbus',
					country: 'USA',
				},
				{
					firstName: 'Raquel',
					lastName: 'Kohler',
					email: 'rkholer33@yopmail.com',
					city: 'Columbus',
					country: 'USA',
				},
				{
					firstName: 'Raquel',
					lastName: 'Kohler',
					email: 'rkholer33@yopmail.com',
					city: 'Columbus',
					country: 'USA',
				},
				{
					firstName: 'Raquel',
					lastName: 'Kohler',
					email: 'rkholer33@yopmail.com',
					city: 'Columbus',
					country: 'USA',
				},
				{
					firstName: 'Raquel',
					lastName: 'Kohler',
					email: 'rkholer33@yopmail.com',
					city: 'Columbus',
					country: 'USA',
				},
				{
					firstName: 'Raquel',
					lastName: 'Kohler',
					email: 'rkholer33@yopmail.com',
					city: 'Columbus',
					country: 'USA',
				},
				{
					firstName: 'Raquel',
					lastName: 'Kohler',
					email: 'rkholer33@yopmail.com',
					city: 'Columbus',
					country: 'USA',
				},
				{
					firstName: 'Raquel',
					lastName: 'Kohler',
					email: 'rkholer33@yopmail.com',
					city: 'Columbus',
					country: 'USA',
				},
				{
					firstName: 'Raquel',
					lastName: 'Kohler',
					email: 'rkholer33@yopmail.com',
					city: 'Columbus',
					country: 'USA',
				},
				{
					firstName: 'Raquel',
					lastName: 'Kohler',
					email: 'rkholer33@yopmail.com',
					city: 'Columbus',
					country: 'USA',
				},
				{
					firstName: 'Raquel',
					lastName: 'Kohler',
					email: 'rkholer33@yopmail.com',
					city: 'Columbus',
					country: 'USA',
				},
				{
					firstName: 'Raquel',
					lastName: 'Kohler',
					email: 'rkholer33@yopmail.com',
					city: 'Columbus',
					country: 'USA',
				},
				{
					firstName: 'Raquel',
					lastName: 'Kohler',
					email: 'rkholer33@yopmail.com',
					city: 'Columbus',
					country: 'USA',
				},
				{
					firstName: 'Raquel',
					lastName: 'Kohler',
					email: 'rkholer33@yopmail.com',
					city: 'Columbus',
					country: 'USA',
				},
			]}
			//optionally override the default column widths
			defaultColumn={{
				maxSize: 400,
				minSize: 80,
				size: 150, //default size is usually 180
			}}
			enableColumnResizing
			columnResizeMode="onChange" //default
		/>
	);
};

const makeColumnVisiblityOpts = (columns: string[]) => {
	return _.reduce(columns, (acc, column) => ({ ...acc, [column]: false }), {});
};

const Tablee = (props) => {
	const [{ orderedHeaders, disabledColumns, pinnedColumns, pageData, enableWordWrap }] = useLogsStore(
		(store) => store.tableOpts,
	);
	const columns = useMemo(() => makeHeaderOpts(orderedHeaders), [orderedHeaders]);
	const columnVisibility = useMemo(() => makeColumnVisiblityOpts(disabledColumns), [disabledColumns, orderedHeaders]);

	return (
		<MantineReactTable
			enableBottomToolbar={false}
			enableTopToolbar={false}
			enableColumnResizing={true}
			enableSorting={false}
			mantineTableBodyCellProps={{
				style: {
					padding: '0.5rem 1rem',
					fontSize: '0.6rem',
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					display: 'table-cell',
					...(enableWordWrap ? { whiteSpace: 'nowrap' } : {}),
				},
			}}
			mantineTableHeadRowProps={{ style: { border: 'none' } }}
			mantineTableHeadCellProps={{
				style: {
					fontWeight: 600,
					fontSize: '0.65rem',
					border: 'none',
					padding: '0.5rem 1rem',
				},
			}}
			mantineTableBodyRowProps={({ row }) => {
				return {
					style: {
						border: 'none',
						background: row.index % 2 === 0 ? '#f8f9fa' : 'white',
					},
				};
			}}
			mantineTableHeadProps={{
				style: {
					border: 'none',
				},
			}}
			columns={columns}
			data={pageData}
			mantinePaperProps={{ style: { border: 'none' } }}
			enablePagination={false}
			enableColumnPinning={true}
			initialState={{
				columnPinning: {
					left: pinnedColumns,
				},
			}}
			enableStickyHeader={true}
			defaultColumn={{ minSize: 100 }}
			layoutMode="grid"
			state={{
				columnPinning: {
					left: pinnedColumns,
				},
				columnVisibility,
				columnOrder: orderedHeaders,
			}}
			mantineTableContainerProps={{
				style: {
					height: `calc(100vh - ${props.primaryHeaderHeight + LOGS_FOOTER_HEIGHT}px )`,
				},
			}}
		/>
	);
};

const LogTable = (props: {
	errorMessage: string | null;
	hasNoData: boolean;
	showTable: boolean;
	isFetchingCount: boolean;
}) => {
	const { errorMessage, hasNoData, showTable, isFetchingCount } = props;
	const [maximized] = useAppStore((store) => store.maximized);
	const primaryHeaderHeight = !maximized
		? PRIMARY_HEADER_HEIGHT + STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT + STREAM_SECONDARY_TOOLBAR_HRIGHT
		: 0;

	return (
		<TableContainer>
			<FilterPills />
			{!errorMessage ? (
				showTable ? (
					<Box className={tableStyles.innerContainer} style={{ maxHeight: `calc(100vh - ${primaryHeaderHeight}px )` }}>
						<Box
							className={tableStyles.innerContainer}
							style={{
								maxHeight: `calc(100vh - ${primaryHeaderHeight}px )`,
								height: `calc(100vh - ${primaryHeaderHeight}px )`,
							}}>
							<Tablee primaryHeaderHeight={primaryHeaderHeight} />
						</Box>
					</Box>
				) : hasNoData ? (
					<EmptyBox message="No Matching Rows" />
				) : (
					<LoadingView />
				)
			) : (
				<ErrorView message={errorMessage} />
			)}
			<Footer loaded={showTable} hasNoData={hasNoData} isFetchingCount={isFetchingCount} />
		</TableContainer>
	);
};

export default LogTable;
