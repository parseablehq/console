import { useGetQueryCount } from '@/hooks/useGetQueryCount';
import useMountedState from '@/hooks/useMountedState';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Carousel } from '@mantine/carousel';
import { Box, UnstyledButton } from '@mantine/core';
import dayjs from 'dayjs';

import { FC, useEffect } from 'react';
import FillCarousel from './CarouselSlide';
import { useLogsPageContext } from './Context';
import Loading from '@/components/Loading';

const Limit = 10000;
const gapOptions = [1, 5, 10, 15, 20, 30, 60];

const HeaderPagination: FC = () => {
	const {
		state: { subLogQuery },
	} = useHeaderContext();

	const [endDatePointer, setEndDatePointer] = useMountedState<Date | null>(null);
	const [gapTemp, setGapTemp] = useMountedState<number>(0);
	const [gapMinute, setGapMinute] = useMountedState<number>(0);
	const [upperLimit, setUpperLimit] = useMountedState<number>(20);
	const [slots, setSlots] = useMountedState<
		{
			gapMinute: number;
			endtime: Date;
			id: number;
		}[]
	>([]);

	const {
		data: queryCountRes,
		error: queryCountError,
		loading: queryCountLoading,
		getQueryCountData,
		resetData: resetQueryCountData,
	} = useGetQueryCount();
	const {
		state: { subGapTime },
	} = useLogsPageContext();

	const getMinuteCount = (minute: number) => {
		if (endDatePointer) {
			const startTime = dayjs(endDatePointer).subtract(minute, 'minute').toDate();
			if (subLogQuery.get().streamName) {
				getQueryCountData({
					startTime: startTime,
					endTime: endDatePointer,
					streamName: subLogQuery.get().streamName,
					access: subLogQuery.get().access,
				});
			}
		}
	};

	useEffect(() => {
		const logQueryListener = subLogQuery.subscribe((query) => {
			if (query.endTime) {
				let tempDate = new Date(query.endTime);
				tempDate.setSeconds(0, 0);
				resetQueryCountData();
				subGapTime.set(null);
				setGapTemp(0);
				setGapMinute(0);
				setSlots([]);
				setUpperLimit(20);
				setEndDatePointer(tempDate);
			}
		});
		if (subLogQuery.get().endTime) {
			let tempDate = new Date(subLogQuery.get().endTime);
			tempDate.setSeconds(0, 0);
			setEndDatePointer(tempDate);
			getMinuteCount(gapOptions[gapTemp]);
		}

		return () => {
			logQueryListener();
		};
	}, []);

	useEffect(() => {
		if (endDatePointer) {
			getMinuteCount(gapOptions[gapTemp]);
		}
	}, [endDatePointer]);

	useEffect(() => {
		if (queryCountRes) {
			if (
				queryCountRes[0].totalcurrentcount < Limit &&
				gapTemp !== gapOptions.length - 1 &&
				gapOptions[gapTemp + 1] < dayjs(subLogQuery.get().endTime).diff(dayjs(subLogQuery.get().startTime), 'minute')
			) {
				setGapTemp(gapTemp + 1);
				getMinuteCount(gapOptions[gapTemp + 1]);
			} else if (
				queryCountRes[0].totalcurrentcount < Limit &&
				gapTemp <= gapOptions.length - 1 &&
				gapOptions[gapTemp + 1] >= dayjs(subLogQuery.get().endTime).diff(dayjs(subLogQuery.get().startTime), 'minute')
			) {
				setGapMinute(gapOptions[gapTemp]);
			} else if (queryCountRes[0].totalcurrentcount >= Limit || gapTemp === gapOptions.length - 1) {
				setGapMinute(gapOptions[gapTemp]);
			}
		}
	}, [queryCountRes]);

	useEffect(() => {
		if (gapMinute !== 0) {
			const tempSlots = [];
			for (
				let i = dayjs(subLogQuery.get().endTime).toDate(), j = 1;
				i > subLogQuery.get().startTime && j <= upperLimit;
				i = dayjs(i).subtract(gapMinute, 'minute').toDate(), j++
			) {
				tempSlots.push({
					gapMinute: gapMinute,
					endtime: i,
					id: j,
				});
			}
			setSlots(tempSlots);
		}
	}, [gapMinute]);

	const loadMore = () => {
		if (
			subLogQuery.get().endTime &&
			slots.length > 0 &&
			slots[slots.length - 1].endtime > subLogQuery.get().startTime
		) {
			setUpperLimit(upperLimit + 20);
			for (
				let i = dayjs(slots[slots.length - 1].endtime).toDate(), j = slots[slots.length - 1].id + 1;
				dayjs(i).subtract(gapMinute, 'minute').toDate() > subLogQuery.get().startTime && j <= upperLimit;
				i = dayjs(i).subtract(gapMinute, 'minute').toDate(), j++
			) {
				setSlots((prev) => [
					...prev,
					{
						gapMinute: gapMinute,
						endtime: i,
						id: j,
					},
				]);
			}
		}
	};

	return (
		<Box h={124}>
			{gapMinute === 0 || queryCountLoading ? (
				<Loading visible zIndex={0} />
			) : (
				<Carousel
					p={'sm'}
					px={50}
					height={100}
					slideSize="12.5%"
					slideGap="sm"
					align="start"
					slidesToScroll={8}
					styles={{
						control: {
							'&[data-inactive]': {
								opacity: 0,
								cursor: 'default',
							},
						},
					}}>
					{slots.map((slot) => (
						<FillCarousel key={slot.id} {...slot} />
					))}
					<Carousel.Slide>
						<UnstyledButton
							sx={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								height: '100%',
								border: '1px solid #ccc',
								borderRadius: '10px',
								flexDirection: 'column',
								padding: '10px',
								width: '100%',
							}}
							onClick={loadMore}>
							{subLogQuery.get().endTime &&
							slots.length > 0 &&
							dayjs(slots[slots.length - 1].endtime)
								.subtract(gapMinute, 'minute')
								.toDate() > subLogQuery.get().startTime
								? 'Load More'
								: 'No More Data'}
						</UnstyledButton>
					</Carousel.Slide>
				</Carousel>
			)}
			{queryCountError && <div>{queryCountError}</div>}
		</Box>
	);
};

export default HeaderPagination;
