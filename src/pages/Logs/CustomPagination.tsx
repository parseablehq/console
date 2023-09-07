import { useGetQueryCount } from '@/hooks/useGetQueryCount';
import useMountedState from '@/hooks/useMountedState';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Group, Pagination, Tooltip } from '@mantine/core';

import dayjs from 'dayjs';
import { FC, useEffect } from 'react';

type PaginationProps = {
	currentStartTime: Date | null;
	setCurrentStartTime: (date: Date | null) => void;
	pageLogData: any;
	goToPage: (page: number, limit: number) => void;
	setCurrentCount: (currentCount:number)=>void;
};
const CustomPagination: FC<PaginationProps> = (props) => {
	const { currentStartTime, pageLogData, goToPage, setCurrentStartTime,setCurrentCount } = props;
	const [nextStartTimeTemp, setNextStartTimeTemp] = useMountedState<Date | null>(null);
	const [nextStartTime, setNextStartTime] = useMountedState<Date | null>(null);
	const [prevStartTimeTemp, setPrevStartTimeTemp] = useMountedState<Date | null>(null);
	const [prevStartTime, setPrevStartTime] = useMountedState<Date | null>(null);

	const {
		state: { subLogQuery },
	} = useHeaderContext();
	const { data: queryCountResForNext, getQueryCountData: getQueryCountDataForNext } = useGetQueryCount();
	const { data: queryCountResForPrev, getQueryCountData: getQueryCountDataForPrev } = useGetQueryCount();

	useEffect(() => {
		if (currentStartTime) {
			setPrevStartTimeTemp(dayjs(currentStartTime).add(1, 'minute').toDate());
			setNextStartTimeTemp(dayjs(currentStartTime).subtract(1, 'minute').toDate());
		}
	}, [currentStartTime]);

	useEffect(() => {
		if (nextStartTimeTemp) {
			getQueryCountDataForNext({
				startTime: nextStartTimeTemp,
				endTime: dayjs(nextStartTimeTemp).add(1, 'minute').toDate(),
				streamName: subLogQuery.get().streamName,
				access: subLogQuery.get().access,
			});
		}
	}, [nextStartTimeTemp]);

	useEffect(() => {
		if (
			queryCountResForNext &&
			queryCountResForNext[0].totalcurrentcount === 0 &&
			nextStartTimeTemp &&
			nextStartTimeTemp >= subLogQuery.get().startTime
		) {
			setNextStartTimeTemp(new Date(dayjs(nextStartTimeTemp).subtract(1, 'minute').toDate()));
		} else if (queryCountResForNext && queryCountResForNext[0].totalcurrentcount !== 0 &&nextStartTimeTemp &&
			nextStartTimeTemp >= subLogQuery.get().startTime) {
			setNextStartTime(nextStartTimeTemp);
		}
	}, [queryCountResForNext]);

	useEffect(() => {
		if (prevStartTimeTemp) {
			getQueryCountDataForPrev({
				startTime: prevStartTimeTemp,
				endTime: dayjs(prevStartTimeTemp).add(1, 'minute').toDate(),
				streamName: subLogQuery.get().streamName,
				access: subLogQuery.get().access,
			});
		}
	}, [prevStartTimeTemp]);

	useEffect(() => {
		if (
			queryCountResForPrev &&
			queryCountResForPrev[0].totalcurrentcount === 0 &&
			prevStartTimeTemp &&
			prevStartTimeTemp <= subLogQuery.get().endTime
		) {
			setPrevStartTimeTemp(new Date(dayjs(prevStartTimeTemp).add(1, 'minute').toDate()));
		} else if (
			queryCountResForPrev &&
			queryCountResForPrev[0].totalcurrentcount !== 0 &&
			prevStartTimeTemp &&
			prevStartTimeTemp <= subLogQuery.get().endTime
		) {
			setPrevStartTime(prevStartTimeTemp);
		}
	}, [queryCountResForPrev]);

	return (
		<>
			
				<Pagination.Root
					total={pageLogData?.totalPages || 1}
					value={pageLogData?.page || 1}
					onChange={(page) => {
						goToPage(page, pageLogData?.limit || 1);
					}}>
					<Group spacing={5} position="center">
						<Tooltip label="Load newer data">
							<Pagination.First
								disabled={Boolean(!prevStartTime)}
								onClick={() => {
									if (prevStartTime) {
										setCurrentStartTime(prevStartTime);
										setCurrentCount(queryCountResForPrev[0].totalcurrentcount)
									}
								}}
							/>
						</Tooltip>
						<Pagination.Previous />
						<Pagination.Items />
						<Pagination.Next />
						<Tooltip label="Load older data">
							<Pagination.Last
								onClick={() => {
									if (nextStartTime) {
										setCurrentStartTime(nextStartTime);
										setCurrentCount(queryCountResForNext[0].totalcurrentcount)
									}
								}}
								disabled={Boolean(!nextStartTime)}
							/>
						</Tooltip>
					</Group>
				</Pagination.Root>
		</>
	);
};

export default CustomPagination;
