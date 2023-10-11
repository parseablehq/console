import { useGetQueryCount } from '@/hooks/useGetQueryCount';
import useMountedState from '@/hooks/useMountedState';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Carousel } from '@mantine/carousel';
import { Box, Button, Text } from '@mantine/core';
import dayjs from 'dayjs';

import { FC, useEffect, useRef } from 'react';
import FillCarousel from './CarouselSlide';
import { useLogsPageContext } from './Context';
import Loading from '@/components/Loading';

const Limit = 10000;
const gapOptions = [1, 5, 10, 15, 20, 30, 60];

const HeaderPagination: FC = () => {
	const {
		state: { subLogQuery },
	} = useHeaderContext();
	const [headDate, setHeadDate] = useMountedState<Date | null>(null);

	const [endDatePointer, setEndDatePointer] = useMountedState<Date | null>(null);
	const [gapTemp, setGapTemp] = useMountedState<number>(0);
	const [gapMinute, setGapMinute] = useMountedState<number>(0);
	const [upperLimit, setUpperLimit] = useMountedState<number>(20);
	const slots = useRef<
		| {
				gapMinute: number;
				endtime: Date;
				id: number;
		  }[]
		| null
	>(null);

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
				slots.current = null;
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
			slots.current = tempSlots;
		}
	}, [gapMinute]);

	const loadMore = () => {
		if (
			subLogQuery.get().endTime &&
			slots.current &&
			slots.current.length > 0 &&
			slots.current[slots.current.length - 1].endtime > subLogQuery.get().startTime
		) {
			setUpperLimit(upperLimit + 20);
			for (
				let i = dayjs(slots.current[slots.current.length - 1].endtime).toDate(),
					j = slots.current[slots.current.length - 1].id + 1;
				dayjs(i).subtract(gapMinute, 'minute').toDate() > subLogQuery.get().startTime && j <= upperLimit + 20;
				i = dayjs(i).subtract(gapMinute, 'minute').toDate(), j++
			) {
				slots.current.push({
					gapMinute: gapMinute,
					endtime: i,
					id: j,
				});
			}
		}
	};

	const onSlideChange = (index: number) => {
		if (slots.current && slots.current.length - 1 >= index * 8) {
			setHeadDate(dayjs(slots.current[index * 8].endtime).toDate());
		}
	};

	return (
		<Box
			h={110}
			sx={{
				overflow: 'hidden',
			}}>
			{gapMinute === 0 || queryCountLoading ? (
				<Loading visible zIndex={0} />
			) : (
				<>
					<Text
						sx={{
							fontSize: '1rem',
							fontWeight: 500,
							color: '#211F1F',
							padding: '12px',
						}}>
						{' '}
						Time Slots: {dayjs(headDate).format('DD-MM-YYYY')}
					</Text>
					<Carousel
						p={'sm'}
						px={50}
						height={36}
						slideSize="12.5%"
						slideGap="sm"
						align="start"
						slidesToScroll={8}
						onSlideChange={onSlideChange}
						styles={{
							viewport: {
								overflow: 'unset',
							},
						}}>
						{slots.current?.map((slot) => (
							<FillCarousel key={slot.id} {...slot} />
						))}

						<Carousel.Slide>
							<Button
								sx={{
									backgroundColor: '#fff',
									color: '#211F1F',
									border: '1px solid #ccc',
									borderRadius: '10px',
									padding: '10px',
									width: '100%',
								}}
								disabled={Boolean(
									subLogQuery.get().startTime &&
										slots.current &&
										dayjs(slots.current[slots.current.length - 1].endtime)
											.subtract(gapMinute + 1, 'minute')
											.toDate() <= subLogQuery.get().startTime,
								)}
								onClick={loadMore}>
								{subLogQuery.get().endTime &&
								slots.current &&
								dayjs(slots.current[slots.current.length - 1].endtime)
									.subtract(gapMinute + 1, 'minute')
									.toDate() <= subLogQuery.get().startTime
									? 'No More Data'
									: 'Load More'}
							</Button>
						</Carousel.Slide>
					</Carousel>
				</>
			)}
			{queryCountError && <div>{queryCountError}</div>}
		</Box>
	);
};

export default HeaderPagination;
