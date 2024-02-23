import { useGetQueryCount } from '@/hooks/useGetQueryCount';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Box, Button, Modal, Text, Tooltip } from '@mantine/core';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useLogsPageContext } from './context';
import useMountedState from '@/hooks/useMountedState';
import { Carousel } from '@mantine/carousel';
import carouselStyles from './styles/CarouselSlide.module.css';

type FillCarouselProps = {
	gapMinute: number;
	endtime: Date;
	id: number;
	zoomIn: () => void;
};
const FillCarousel = ({ gapMinute, endtime, id, zoomIn }: FillCarouselProps) => {
	const {
		state: { subLogQuery, subLogSelectedTimeRange },
	} = useHeaderContext();
	const {
		state: { subGapTime },
	} = useLogsPageContext();
	const [subID, setSubID] = useMountedState<number | null>(null);
	const [overLimit, setOverLimit] = useMountedState<boolean>(false);

	const { data: count, error, loading, getQueryCountData: getCount } = useGetQueryCount();

	const parsedEndTime = dayjs(endtime).set('second', 0).set('millisecond', 0).toDate();

	useEffect(() => {
		getCount({
			startTime: dayjs(parsedEndTime).subtract(gapMinute, 'minute').toDate(),
			endTime: parsedEndTime,
			streamName: subLogQuery.get().streamName,
			access: subLogQuery.get().access,
		});
		const subID = subGapTime.subscribe((data) => {
			if (data) {
				setSubID(data.id);
			}
		});
		return () => {
			subID();
		};
	}, [gapMinute]);

	useEffect(() => {
		if (count && count[0].totalcurrentcount !== 0 && ((subGapTime.get()?.id ?? 0) > id || subGapTime.get() === null)) {
			subGapTime.set({
				startTime: dayjs(parsedEndTime).subtract(gapMinute, 'minute').toDate(),
				endTime: parsedEndTime,
				id: id,
			});
		}
	}, [count]);

	const classes = carouselStyles;

	return (
		<Carousel.Slide>
			<Tooltip
				label={
					loading
						? 'Loading...'
						: count
						? dayjs(parsedEndTime).day() !== dayjs(parsedEndTime).subtract(gapMinute, 'minute').day()
							? count[0].totalcurrentcount === 0
								? `Date changed from ${dayjs(parsedEndTime).format('DD-MMM-YYYY')} to ${dayjs(parsedEndTime)
										.subtract(gapMinute, 'minute')
										.format('DD-MMM-YYYY')}, no events durning this period`
								: `Day changed from ${dayjs(parsedEndTime).format('DD-MMM-YYYY')} to ${dayjs(parsedEndTime)
										.subtract(gapMinute, 'minute')
										.format('DD-MMM-YYYY')}, ${count[0].totalcurrentcount} events`
							: count[0].totalcurrentcount === 0
							? 'No events durning this period'
							: `${count[0].totalcurrentcount} events`
						: error
						? error
						: 'Unexpected Error'
				}
				withArrow
				color="blue"
				position="top">
				<Box>
					<Button
						style={{
							backgroundColor: '#fff',
							color: subID === id ? '#535BEB' : '#211F1F',
							border: subID === id ? '1px solid #535BEB' : '1px solid #ccc',
							borderRadius: '.5rem',
							padding: '10px',
							width: '100%',
						}}
						disabled={count && count[0].totalcurrentcount === 0}
						onClick={() => {
							if ((count && count[0].totalcurrentcount < 30000) || gapMinute === 1) {
								subGapTime.set({
									startTime: dayjs(parsedEndTime).subtract(gapMinute, 'minute').toDate(),
									endTime: parsedEndTime,
									id: id,
								});
							}
							if (count && count[0].totalcurrentcount >= 30000 && gapMinute !== 1) {
								setOverLimit(true);
							}
						}}>
						{dayjs(parsedEndTime).format('HH:mm')} -{' '}
						{dayjs(parsedEndTime).subtract(gapMinute, 'minute').format('HH:mm')}
					</Button>
				</Box>
			</Tooltip>
			<Modal centered opened={overLimit} onClose={() => setOverLimit(false)} title="Over 30,000 events" size={'lg'}>
				<Box pb="lg">
					<Text mb="lg">
						{dayjs(parsedEndTime).format('DD-MMM-YYYY HH:mm')} -{' '}
						{dayjs(parsedEndTime).subtract(gapMinute, 'minute').format('DD-MMM-YYYY HH:mm')}
					</Text>
					<Text mb="lg">
						You have reached the limit of 30,000 events per query zoom in to continue or view this time period. If you
						load more than 30,000 events, the browser may become unresponsive.
					</Text>
					<Box>
						<Button
							className={classes.controlBtn}
							onClick={() => {
								setOverLimit(false);
							}}>
							Close
						</Button>

						<Button
							className={classes.controlBtn}
							onClick={() => {
								zoomIn();
								setOverLimit(false);
							}}>
							Zoom In
						</Button>
						<Button
							className={classes.controlBtn}
							onClick={() => {
								subLogQuery.set({
									...subLogQuery.get(),
									startTime: dayjs(parsedEndTime).subtract(gapMinute, 'minute').toDate(),
									endTime: parsedEndTime,
								});
								subLogSelectedTimeRange.set({
									state: 'custom',
									value: `${dayjs(parsedEndTime).subtract(gapMinute, 'minute').format('DD-MMM-YYYY HH:mm')} - ${dayjs(
										parsedEndTime,
									).format('DD-MMM-YYYY HH:mm')}`,
								});
								setOverLimit(false);
							}}>
							View this time period
						</Button>
						<Button
							className={classes.controlBtn}
							onClick={() => {
								subGapTime.set({
									startTime: dayjs(parsedEndTime).subtract(gapMinute, 'minute').toDate(),
									endTime: parsedEndTime,
									id: id,
								});
								setOverLimit(false);
							}}>
							Load anyway
						</Button>
					</Box>
				</Box>
			</Modal>
		</Carousel.Slide>
	);
};

export default FillCarousel;
