import { FC, useCallback } from 'react';
import { useLogsStore, logsStoreReducers, LOAD_LIMIT, LOG_QUERY_LIMITS } from '../../providers/LogsProvider';
import { usePagination } from '@mantine/hooks';
import { Box, Center, Group, Loader, Menu, Pagination, Stack, Tooltip } from '@mantine/core';
import _ from 'lodash';
import { Text } from '@mantine/core';
import { HumanizeNumber } from '@/utils/formatBytes';
import { IconSelector } from '@tabler/icons-react';
import useMountedState from '@/hooks/useMountedState';
import classes from '../../styles/Footer.module.css';
import { LOGS_FOOTER_HEIGHT } from '@/constants/theme';
import { useSearchParams } from 'react-router-dom';

const { setPageAndPageData, setCurrentPage, setCurrentOffset } = logsStoreReducers;

const TotalCount = (props: { totalCount: number }) => {
	return (
		<Tooltip label={props.totalCount}>
			<Text style={{ fontSize: '0.7rem' }}>{HumanizeNumber(props.totalCount)}</Text>
		</Tooltip>
	);
};

const TotalLogsCount = (props: { hasTableLoaded: boolean; isFetchingCount: boolean; isTableEmpty: boolean }) => {
	const [{ totalCount, perPage, pageData }] = useLogsStore((store) => store.tableOpts);
	const displayedCount = _.size(pageData);
	const showingCount = displayedCount < perPage ? displayedCount : perPage;
	if (typeof totalCount !== 'number' || typeof displayedCount !== 'number') return <Stack />;
	return (
		<Stack style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }} gap={6}>
			{props.hasTableLoaded ? (
				props.isFetchingCount ? (
					<Loader type="dots" />
				) : (
					<>
						<Text style={{ fontSize: '0.7rem' }}>{`Showing ${showingCount} out of`}</Text>
						<TotalCount totalCount={totalCount} />
						<Text style={{ fontSize: '0.7rem' }}>records</Text>
					</>
				)
			) : props.isTableEmpty ? null : (
				<Loader type="dots" />
			)}
		</Stack>
	);
};

const LimitControl: FC = () => {
	const [opened, setOpened] = useMountedState(false);
	const [perPage, setLogsStore] = useLogsStore((store) => store.tableOpts.perPage);

	const toggle = () => {
		setOpened(!opened);
	};

	const onSelect = (limit: number) => {
		if (perPage !== limit) {
			setLogsStore((store) => setPageAndPageData(store, 1, limit));
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

const Footer = (props: { loaded: boolean; hasNoData: boolean; isFetchingCount: boolean }) => {
	const [searchParams] = useSearchParams();
	const [tableOpts, setLogsStore] = useLogsStore((store) => store.tableOpts);
	const { totalPages, currentOffset, currentPage, perPage, totalCount } = tableOpts;

	const onPageChange = useCallback((page: number) => {
		setLogsStore((store) => setPageAndPageData(store, page));
	}, []);

	const pagination = usePagination({
		total: totalPages ?? 1,
		initialPage:
			(_.toNumber(searchParams.get('page')) && _.toNumber(searchParams.get('page'))) > 0
				? _.toNumber(searchParams.get('page'))
				: 1,
		onChange: onPageChange,
	});
	const onChangeOffset = useCallback(
		(key: 'prev' | 'next') => {
			if (key === 'prev') {
				const targetOffset = currentOffset - LOAD_LIMIT;
				if (currentOffset < 0) return;

				if (targetOffset === 0 && currentOffset > 0) {
					// hack to initiate fetch
					setLogsStore((store) => setCurrentPage(store, 0));
				}
				setLogsStore((store) => setCurrentOffset(store, targetOffset));
			} else {
				const targetOffset = currentOffset + LOAD_LIMIT;
				setLogsStore((store) => setCurrentOffset(store, targetOffset));
			}
		},
		[currentOffset],
	);

	return (
		<Stack className={classes.footerContainer} gap={0} style={{ height: LOGS_FOOTER_HEIGHT }}>
			<Stack w="100%" justify="center" align="flex-start">
				<TotalLogsCount
					hasTableLoaded={props.loaded}
					isFetchingCount={props.isFetchingCount}
					isTableEmpty={props.hasNoData}
				/>
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
				<LimitControl />
			</Stack>
		</Stack>
	);
};

export default Footer;
