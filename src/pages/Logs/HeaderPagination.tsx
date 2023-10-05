import { useGetQueryCount } from '@/hooks/useGetQueryCount';
import useMountedState from '@/hooks/useMountedState';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Carousel } from '@mantine/carousel';
import { Box, Switch } from '@mantine/core';
import dayjs from 'dayjs';

import { FC, useEffect } from 'react';
import FillCarousel from './CarouselSlide';
import { useLogsPageContext } from './Context';
import { theme } from '@/components/Mantine/theme';
import { IconEye, IconEyeClosed } from '@tabler/icons-react';
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
	const [checked, setChecked] = useMountedState(true);

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
			getQueryCountData({
				startTime: startTime,
				endTime: endDatePointer,
				streamName: subLogQuery.get().streamName,
				access: subLogQuery.get().access,
			});
		}
	};

	useEffect(() => {
		const logQueryListener = subLogQuery.subscribe((query) => {
			if (query.streamName) {
				let tempDate = new Date(subLogQuery.get().endTime);
				tempDate.setSeconds(0, 0);
				resetQueryCountData();
				subGapTime.set(null);
				setGapTemp(0);
				setGapMinute(0);
				setEndDatePointer(query.endTime);
			}
		});
		setEndDatePointer(subLogQuery.get().endTime);
		getMinuteCount(gapOptions[gapTemp]);
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
				console.log('gapTemp', gapTemp);
				setGapTemp(gapTemp + 1);
				getMinuteCount(gapOptions[gapTemp + 1]);
			} else if (
				queryCountRes[0].totalcurrentcount < Limit &&
				gapTemp <= gapOptions.length - 1 &&
				gapOptions[gapTemp + 1] >= dayjs(subLogQuery.get().endTime).diff(dayjs(subLogQuery.get().startTime), 'minute')
			) {
				console.log('gapTemp', gapTemp);
				setGapMinute(gapOptions[gapTemp]);
			} else if (queryCountRes[0].totalcurrentcount >= Limit || gapTemp === gapOptions.length - 1) {
				console.log('gapTemp', gapTemp);
				setGapMinute(gapOptions[gapTemp]);
			}
		}
	}, [queryCountRes]);

	const renderCarousel = () => {
		let carouselArr = [];
		for (
			let i = subLogQuery.get().endTime, j = 0;
			i > subLogQuery.get().startTime;
			i = dayjs(i).subtract(gapMinute, 'minute').toDate(), j++
		) {
			carouselArr.push(<FillCarousel checked={checked} gapMinute={gapMinute} endtime={i} id={j} key={j} />);
		}
		return carouselArr;
	};

	return (
		<Box h={148}>
			{gapMinute === 0 || queryCountLoading ? (
				<Loading visible />
			) : (
				<Carousel
					p={'sm'}
					height={100}
					slideSize="20%"
					slideGap="sm"
					align="start"
					slidesToScroll={5}
					styles={{
						control: {
							'&[data-inactive]': {
								opacity: 0,
								cursor: 'default',
							},
						},
					}}>
					{renderCarousel()}
				</Carousel>
			)}
			<Switch
				size="md"
				color={theme.colorScheme === 'dark' ? 'gray' : 'dark'}
				onLabel={<IconEye size="1rem" stroke={2.5} />}
				offLabel={<IconEyeClosed size="1rem" stroke={2.5} />}
				checked={checked}
				onChange={() => {
					setChecked(!checked);
				}}
				styles={{
					body: {
						justifyContent: 'center',
					},
				}}
			/>
			{queryCountError && <div>{queryCountError}</div>}
		</Box>
	);
};

export default HeaderPagination;
