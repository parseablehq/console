import useMountedState from '@/hooks/useMountedState';
import { FIXED_DURATIONS, useHeaderContext } from '@/layouts/MainLayout/Context';
import { Box, Button, Menu, Text, UnstyledButton, px } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconClock } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { Fragment, useEffect, useMemo } from 'react';
import { useLogQueryStyles } from './styles';

type FixedDurations = (typeof FIXED_DURATIONS)[number];

const TimeRange: FC = () => {
	const {
		state: { subLogQuery, subLogSelectedTimeRange },
	} = useHeaderContext();

	const [selectedRange, setSelectedRange] = useMountedState<string>(subLogSelectedTimeRange.get());

	useEffect(() => {
		const listener = subLogSelectedTimeRange.subscribe((state) => {
			setSelectedRange(state);
		});

		return () => listener();
	}, []);

	const onDurationSelect = (duration: FixedDurations) => {
		subLogSelectedTimeRange.set(duration.name);
		const now = dayjs();

		subLogQuery.set((query) => {
			query.startTime = now.subtract(duration.milliseconds, 'milliseconds').toDate();
			query.endTime = now.toDate();
		});
	};

	const { classes, cx } = useLogQueryStyles();
	const {
		timeRangeBTn,
		timeRangeContainer,
		fixedRangeContainer,
		fixedRangeBtn,
		fixedRangeBtnSelected,
		customRangeContainer,
	} = classes;

	return (
		<Menu withArrow position="top">
			<Menu.Target>
				<Button className={timeRangeBTn} leftIcon={<IconClock size={px('1.2rem')} stroke={1.5} />}>
					<Text>{selectedRange}</Text>
				</Button>
			</Menu.Target>
			<Menu.Dropdown>
				<Box className={timeRangeContainer}>
					<Box className={fixedRangeContainer}>
						{FIXED_DURATIONS.map((duration) => {
							return (
								<UnstyledButton
									disabled={selectedRange === duration.name}
									className={cx(fixedRangeBtn, {
										[fixedRangeBtnSelected]: selectedRange === duration.name,
									})}
									key={duration.name}
									onClick={() => onDurationSelect(duration)}>
									{duration.name}
								</UnstyledButton>
							);
						})}
					</Box>
					<Box className={customRangeContainer}>
						<CustomTimeRange />
					</Box>
				</Box>
			</Menu.Dropdown>
		</Menu>
	);
};

const CustomTimeRange: FC = () => {
	const {
		state: { subLogQuery, subLogSelectedTimeRange },
	} = useHeaderContext();

	const [selectedRange, setSelectedRange] = useMountedState({
		startTime: subLogQuery.get().startTime,
		endTime: subLogQuery.get().endTime,
	});

	const onRangeSelect = (key: keyof typeof selectedRange, date: Date) => {
		setSelectedRange((state) => {
			state[key] = date;
			return { ...state };
		});
	};

	const onApply = () => {
		subLogQuery.set((query) => {
			query.startTime = selectedRange.startTime;
			query.endTime = selectedRange.endTime;
		});
		const startTime = dayjs(selectedRange.startTime).format('DD-MM-YY HH:mm');
		const endTime = dayjs(selectedRange.endTime).format('DD-MM-YY HH:mm');
		subLogSelectedTimeRange.set(`${startTime} - ${endTime}`);
	};

	const { classes } = useLogQueryStyles();
	const { customTimeRangeFooter, customTimeRangeApplyBtn } = classes;

	const isApplicable = useMemo(() => {
		return (
			dayjs(selectedRange.startTime).isSame(subLogQuery.get().startTime, 'seconds') &&
			dayjs(selectedRange.endTime).isSame(subLogQuery.get().endTime, 'seconds')
		);
	}, [selectedRange]);

	const isStartTimeMoreThenEndTime = useMemo(() => {
		return dayjs(selectedRange.startTime).isAfter(selectedRange.endTime, 'seconds');
	}, [selectedRange]);

	return (
		<Fragment>
			<DateTimePicker
				error={isStartTimeMoreThenEndTime ? 'Start time cannot be greater than the end time' : ''}
				maxDate={new Date()}
				value={selectedRange.startTime}
				onChange={(date) => {
					if (date) {
						onRangeSelect('startTime', date);
					}
				}}
				valueFormat="DD-MM-YY HH:mm"
				label="From"
				placeholder="Pick date and time"
			/>
			<DateTimePicker
				error={isStartTimeMoreThenEndTime}
				maxDate={new Date()}
				value={selectedRange.endTime}
				onChange={(date) => {
					if (date) {
						onRangeSelect('endTime', date);
					}
				}}
				valueFormat="DD-MM-YY HH:mm"
				label="To"
				placeholder="Pick date and time"
				mt="md"
			/>
			<Box className={customTimeRangeFooter}>
				<Button
					className={customTimeRangeApplyBtn}
					disabled={isApplicable || isStartTimeMoreThenEndTime}
					onClick={onApply}>
					Apply
				</Button>
			</Box>
		</Fragment>
	);
};

export default TimeRange;
