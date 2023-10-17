import { useGetQueryCount } from '@/hooks/useGetQueryCount';
import useMountedState from '@/hooks/useMountedState';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Carousel, Embla } from '@mantine/carousel';
import { Box, Button, Text, px } from '@mantine/core';
import dayjs from 'dayjs';
import { useHeaderPaginationStyle } from './styles';

import { FC, useEffect } from 'react';
import FillCarousel from './CarouselSlide';
import { useLogsPageContext } from './Context';
import Loading from '@/components/Loading';
import { IconChevronLeft, IconChevronRight, IconZoomIn, IconZoomOut } from '@tabler/icons-react';

const Limit = 10000;
const gapOptions = [1, 5, 10, 15, 20, 30, 60];

const HeaderPagination: FC = () => {
	const {
		state: { subLogQuery },
	} = useHeaderContext();
	const [embla, setEmbla] = useMountedState<Embla | null>(null);
	const [showSlotTime, setShowSlotTime] = useMountedState<{
		startTime: Date;
		endTime: Date;
	} | null>(null);

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
				dayjs(i).subtract(gapMinute, 'minute').toDate() > subLogQuery.get().startTime && j <= upperLimit + 20;
				i = dayjs(i).subtract(gapMinute, 'minute').toDate(), j++
			) {
				slots.push({
					gapMinute: gapMinute,
					endtime: i,
					id: j,
				});
			}
		}
	};

	const onSlideChange = (index: number) => {
		if (slots && slots.length - 1 >= index * 9) {
			if (slots.length - 1 >= (index + 1) * 9) {
				setShowSlotTime({
					startTime: dayjs(slots[index * 9].endtime).toDate(),
					endTime: dayjs(slots[(index + 1) * 9].endtime)
						.subtract(gapMinute, 'minute')
						.toDate(),
				});
			} else {
				setShowSlotTime({
					startTime: dayjs(slots[index * 9].endtime).toDate(),
					endTime: dayjs(slots[slots.length - 1].endtime)
						.subtract(gapMinute, 'minute')
						.toDate(),
				});
			}
		}
	};

	const { classes } = useHeaderPaginationStyle();
	return (
		<Box
			h={95}
			sx={{
				overflow: 'hidden',
			}}>
			{gapMinute === 0 || queryCountLoading ? (
				<Loading visible zIndex={0} />
			) : (
				<>
					<Box className={classes.controlContainer}>
						<Button
							className={classes.controlBtn}
							onClick={() => {
								embla?.scrollPrev();
							}}>
							<IconChevronLeft size={px('1.2rem')} stroke={1.5} />
						</Button>
						<Button
							className={classes.controlBtn}
							onClick={() => {
								if (gapTemp > 0 && gapTemp < gapOptions.length) {
									setGapMinute(gapOptions[gapTemp - 1]);
									setGapTemp(gapTemp - 1);
									subGapTime.set(null);
								}
							}}
							disabled={gapTemp === 0}>
							<IconZoomIn size={px('1.2rem')} stroke={1.5} />
						</Button>

						<Text className={classes.controlText}>
							{dayjs(showSlotTime?.startTime).format('DD-MMM-YYYY HH:mm')} to{' '}
							{dayjs(showSlotTime?.endTime).format('DD-MMM-YYYY HH:mm')}. Slot Size: <b>{gapMinute} min</b>
						</Text>

						<Button
							className={classes.controlBtn}
							onClick={() => {
								if (gapTemp < gapOptions.length - 1) {
									setGapMinute(gapOptions[gapTemp + 1]);
									setGapTemp(gapTemp + 1);
									subGapTime.set(null);
								}
							}}
							disabled={
								gapTemp === gapOptions.length - 1 ||
								gapOptions[gapTemp + 1] >=
									dayjs(subLogQuery.get().endTime).diff(dayjs(subLogQuery.get().startTime), 'minute')
							}>
							<IconZoomOut size={px('1.2rem')} stroke={1.5} />
						</Button>

						<Button
							className={classes.controlBtn}
							onClick={() => {
								embla?.scrollNext();
							}}>
							<IconChevronRight size={px('1.2rem')} stroke={1.5} />
						</Button>
					</Box>

					<Carousel
						p={'sm'}
						height={36}
						slideSize="11.1%"
						slideGap="sm"
						align="start"
						slidesToScroll={9}
						getEmblaApi={setEmbla}
						onSlideChange={onSlideChange}
						styles={{
							viewport: {
								overflow: 'unset',
								overflowX: 'clip',
							},
						}}
						withControls={false}>
						{slots?.map((slot) => (
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
										slots.length &&
										dayjs(slots[slots.length - 1].endtime)
											.subtract(gapMinute + 1, 'minute')
											.toDate() <= subLogQuery.get().startTime,
								)}
								onClick={loadMore}>
								{subLogQuery.get().endTime &&
								slots.length &&
								dayjs(slots[slots.length - 1].endtime)
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
