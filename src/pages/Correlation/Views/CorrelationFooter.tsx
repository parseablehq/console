import { FC, useCallback } from 'react';
import { usePagination } from '@mantine/hooks';
import { Box, Center, Group, Menu, Pagination, Stack } from '@mantine/core';
import _ from 'lodash';
import { Text } from '@mantine/core';
import { IconSelector } from '@tabler/icons-react';
import useMountedState from '@/hooks/useMountedState';
import classes from '../styles/Footer.module.css';
import { LOGS_FOOTER_HEIGHT } from '@/constants/theme';
import { correlationStoreReducers, useCorrelationStore } from '@/pages/Correlation/providers/CorrelationProvider';
import { LOG_QUERY_LIMITS, LOAD_LIMIT } from '@/pages/Stream/providers/LogsProvider';

const { setCurrentOffset, setCurrentPage, setPageAndPageData } = correlationStoreReducers;

const LimitControl: FC = () => {
	const [opened, setOpened] = useMountedState(false);
	const [perPage, setCorrelationStore] = useCorrelationStore((store) => store.tableOpts.perPage);

	const toggle = () => {
		setOpened(!opened);
	};

	const onSelect = (limit: number) => {
		if (perPage !== limit) {
			setCorrelationStore((store) => setPageAndPageData(store, 1, limit));
		}
	};

	return (
		<Box>
			<Menu withArrow withinPortal shadow="md" opened={opened} onChange={setOpened}>
				<Center>
					<Menu.Target>
						<Box onClick={toggle} className={classes.limitBtn}>
							<Text className={classes.limitBtnText}>{perPage}</Text>
							<IconSelector size={'0.8rem'} />
						</Box>
					</Menu.Target>
				</Center>
				<Menu.Dropdown>
					{LOG_QUERY_LIMITS.map((limit) => {
						return (
							<Menu.Item
								className={limit === perPage ? classes.limitActive : classes.limitOption}
								key={limit}
								onClick={() => onSelect(limit)}>
								<Center>
									<Text>{limit}</Text>
								</Center>
							</Menu.Item>
						);
					})}
				</Menu.Dropdown>
			</Menu>
		</Box>
	);
};

const CorrelationFooter = (props: { loaded: boolean; hasNoData: boolean; isFetchingCount: boolean }) => {
	const [tableOpts, setCorrelationStore] = useCorrelationStore((store) => store.tableOpts);
	const { totalPages, currentOffset, currentPage, perPage, totalCount } = tableOpts;

	const onPageChange = useCallback((page: number) => {
		setCorrelationStore((store) => setPageAndPageData(store, page));
	}, []);

	const pagination = usePagination({ total: totalPages ?? 1, initialPage: 1, onChange: onPageChange });
	const onChangeOffset = useCallback(
		(key: 'prev' | 'next') => {
			if (key === 'prev') {
				const targetOffset = currentOffset - LOAD_LIMIT;
				if (currentOffset < 0) return;

				if (targetOffset === 0 && currentOffset > 0) {
					// hack to initiate fetch
					setCorrelationStore((store) => setCurrentPage(store, 0));
				}
				setCorrelationStore((store) => setCurrentOffset(store, targetOffset));
			} else {
				const targetOffset = currentOffset + LOAD_LIMIT;
				setCorrelationStore((store) => setCurrentOffset(store, targetOffset));
			}
		},
		[currentOffset],
	);

	return (
		<Stack className={classes.footerContainer} gap={0} style={{ height: LOGS_FOOTER_HEIGHT }}>
			<Stack w="100%" justify="center" align="flex-start">
				{/* <TotalLogsCount
					hasTableLoaded={props.loaded}
					isFetchingCount={props.isFetchingCount}
					isTableEmpty={props.hasNoData}
				/> */}
			</Stack>
			<Stack w="100%" justify="center">
				{props.loaded ? (
					<Pagination.Root
						total={totalPages}
						value={currentPage}
						onChange={(page) => {
							pagination.setPage(page);
						}}
						size="sm">
						<Group gap={5} justify="center">
							<Pagination.First
								onClick={() => {
									currentOffset !== 0 && onChangeOffset('prev');
								}}
								disabled={currentOffset === 0}
							/>
							<Pagination.Previous />
							{pagination.range.map((page, index) => {
								if (page === 'dots') {
									return <Pagination.Dots key={index} />;
								} else {
									return (
										<Pagination.Control
											value={page}
											key={index}
											active={currentPage === page}
											onClick={() => {
												pagination.setPage(page);
											}}>
											{(perPage ? Math.ceil(page + currentOffset / perPage) : page) ?? 1}
										</Pagination.Control>
									);
								}
							})}
							<Pagination.Next />
							<Pagination.Last
								onClick={() => {
									onChangeOffset('next');
								}}
								disabled={!(currentOffset + LOAD_LIMIT < totalCount)}
							/>
						</Group>
					</Pagination.Root>
				) : null}
			</Stack>
			<Stack w="100%" align="flex-end" style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
				{/* {props.loaded && (
					<Menu position="top">
						<Menu.Target>
							<div>
								<IconButton renderIcon={renderExportIcon} />
							</div>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item onClick={() => exportHandler('CSV')} style={{ padding: '0.5rem 2.25rem 0.5rem 0.75rem' }}>
								CSV
							</Menu.Item>
							<Menu.Item onClick={() => exportHandler('JSON')} style={{ padding: '0.5rem 2.25rem 0.5rem 0.75rem' }}>
								JSON
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				)} */}
				<LimitControl />
			</Stack>
		</Stack>
	);
};

export default CorrelationFooter;
