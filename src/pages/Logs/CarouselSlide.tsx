import { useGetQueryCount } from '@/hooks/useGetQueryCount';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Box, Button, Modal, Tooltip } from '@mantine/core';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useLogsPageContext } from './Context';
import useMountedState from '@/hooks/useMountedState';
import { Carousel } from '@mantine/carousel';

type FillCarouselProps = {
	gapMinute: number;
	endtime: Date;
	id: number;
};
const FillCarousel = ({ gapMinute, endtime, id }: FillCarouselProps) => {
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
						sx={{
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
			<Modal opened={overLimit} onClose={() => setOverLimit(false)}>
				<Box p="lg">
					<Box mb="lg">
						{dayjs(parsedEndTime).format('HH:mm')} -{' '}
						{dayjs(parsedEndTime).subtract(gapMinute, 'minute').format('HH:mm')}
					</Box>
					<Box mb="lg">
						You have reached the limit of 30,000 events per query zoom in to continue or view this time period
					</Box>
					<Button
						variant="light"
						onClick={() => {
							setOverLimit(false);
						}}>
						OK
					</Button>
					<Button
						variant="light"
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
						}}>
						view this time period
					</Button>
				</Box>
			</Modal>
		</Carousel.Slide>
	);
};

export default FillCarousel;
