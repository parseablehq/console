import { useGetQueryCount } from '@/hooks/useGetQueryCount';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Box, Text, UnstyledButton } from '@mantine/core';
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
		<>
			<Carousel.Slide>
				<UnstyledButton
					sx={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						height: '100%',
						border: subID === id ? '1px solid #535BEB' : '1px solid #ccc',
						borderRadius: '10px',
						flexDirection: 'column',
						padding: '10px',
						width: '100%',
					}}
					onClick={() => {
						subGapTime.set({
							startTime: dayjs(parsedEndTime).subtract(gapMinute, 'minute').toDate(),
							endTime: parsedEndTime,
							id: id,
						});
					}}>
					<Text>{loading ? 'Loading' : count ? count[0].totalcurrentcount : error ? error : 'Unexpected Error'}</Text>
					<Text>
						{dayjs(parsedEndTime).format('HH:mm')} :{' '}
						{dayjs(parsedEndTime).subtract(gapMinute, 'minute').format('HH:mm')}
					</Text>
					<Text>{dayjs(parsedEndTime).format('DD-MMM')}</Text>
				</UnstyledButton>
			</Carousel.Slide>
			{dayjs(parsedEndTime).subtract(gapMinute, 'minute').day() !== dayjs(parsedEndTime).day() && (
				<Carousel.Slide>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							height: '100%',
							border: '1px solid #ccc',
							borderRadius: '10px',
							flexDirection: 'row',
							padding: '10px',
							width: '100%',
						}}>
						<Text
							sx={{
								writingMode: 'vertical-rl',
							}}>
							{dayjs(parsedEndTime).format('DD-MMM')}
						</Text>
						<Text
							sx={{
								writingMode: 'vertical-rl',
							}}>
							{dayjs(parsedEndTime).subtract(gapMinute, 'minute').format('DD-MMM')}
						</Text>
					</Box>
				</Carousel.Slide>
			)}
		</>
	);
};

export default FillCarousel;
