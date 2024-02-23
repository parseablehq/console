import { useGetQueryCount } from '@/hooks/useGetQueryCount';
import useMountedState from '@/hooks/useMountedState';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Carousel } from '@mantine/carousel';
import { Box, Button, Text, Tooltip, px } from '@mantine/core';
import dayjs from 'dayjs';
import { FC, useEffect } from 'react';
import FillCarousel from './CarouselSlide';
import { useLogsPageContext } from './context';
import Loading from '@/components/Loading';
import { IconZoomIn, IconZoomOut } from '@tabler/icons-react';
import headerPaginationStyles from './styles/HeaderPagination.module.css';

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

	const zoomIn = () => {
		if (gapTemp > 0 && gapTemp < gapOptions.length) {
			setGapMinute(gapOptions[gapTemp - 1]);
			setGapTemp(gapTemp - 1);
			subGapTime.set(null);
		}
	};
	const zoomOut = () => {
		if (gapTemp < gapOptions.length - 1) {
			setGapMinute(gapOptions[gapTemp + 1]);
			setGapTemp(gapTemp + 1);
			subGapTime.set(null);
		}
	};

	const classes = headerPaginationStyles;
	return (
		<Box
			h={105}
			style={{
				overflow: 'hidden',
			}}>
			{gapMinute === 0 || queryCountLoading ? (
				<Loading visible zIndex={0} />
			) : (
				<>
					<Box className={classes.controlContainer}>
						<Text className={classes.controlText}>Showing events in blocks of {gapMinute} min</Text>
						<Tooltip
							label={gapOptions[gapTemp - 1] ? `Change Block time to ${gapOptions[gapTemp - 1]} min` : 'Loading...'}>
							<Button className={classes.controlBtn} onClick={zoomIn} disabled={gapTemp === 0}>
								<IconZoomIn size={px('1.2rem')} stroke={1.5} />
							</Button>
						</Tooltip>
						<Tooltip
							label={gapOptions[gapTemp + 1] ? `Change Block time to ${gapOptions[gapTemp + 1]} min` : 'Loading...'}>
							<Button
								className={classes.controlBtn}
								onClick={zoomOut}
								disabled={
									gapTemp === gapOptions.length - 1 ||
									gapOptions[gapTemp + 1] >=
										dayjs(subLogQuery.get().endTime).diff(dayjs(subLogQuery.get().startTime), 'minute')
								}>
								<IconZoomOut size={px('1.2rem')} stroke={1.5} />
							</Button>
						</Tooltip>
					</Box>

					<Carousel
						py={'sm'}
						px={50}
						height={36}
						slideSize="11.1%"
						slideGap="sm"
						align="start"
						slidesToScroll={9}
						styles={{
							viewport: {
								overflow: 'unset',
								overflowX: 'clip',
							},
						}}>
						{slots?.map((slot) => (
							<FillCarousel key={slot.id} {...slot} zoomIn={zoomIn}/>
						))}

						<Carousel.Slide>
							<Button
								style={{
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
