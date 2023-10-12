import { useGetQueryCount } from '@/hooks/useGetQueryCount';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Box, Button, Tooltip } from '@mantine/core';
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
		state: { subLogQuery },
	} = useHeaderContext();
	const {
		state: { subGapTime },
	} = useLogsPageContext();
	const [subID, setSubID] = useMountedState<number | null>(null);

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
	}, []);

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
								? `Date changed from ${dayjs(parsedEndTime).format('DD')} to ${dayjs(parsedEndTime)
										.subtract(gapMinute, 'minute')
										.format('DD')}, no events durning this period`
								: `Day changed from ${dayjs(parsedEndTime).format('DD')} to ${dayjs(parsedEndTime)
										.subtract(gapMinute, 'minute')
										.format('DD')}, ${count[0].totalcurrentcount} events`
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
							subGapTime.set({
								startTime: dayjs(parsedEndTime).subtract(gapMinute, 'minute').toDate(),
								endTime: parsedEndTime,
								id: id,
							});
						}}>
						{dayjs(parsedEndTime).format('HH:mm')} :{' '}
						{dayjs(parsedEndTime).subtract(gapMinute, 'minute').format('HH:mm')}
					</Button>
				</Box>
			</Tooltip>
		</Carousel.Slide>
	);
};

export default FillCarousel;
