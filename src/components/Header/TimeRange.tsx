import useMountedState from '@/hooks/useMountedState';
import { FIXED_DURATIONS, useHeaderContext } from '@/layouts/MainLayout/Context';
import { Box, Button, Menu, Text, UnstyledButton, px } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconClock } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { useEffect, useMemo } from 'react';
import classes from './LogQuery.module.css';

type FixedDurations = (typeof FIXED_DURATIONS)[number];

const TimeRange: FC = () => {
	const {
		state: { subTimeRange },
	} = useHeaderContext();

	const [opened, setOpened] = useMountedState(false);
	const [selectedRange, setSelectedRange] = useMountedState<string>(subTimeRange.get().name);

	useEffect(() => {
		const listener = subTimeRange.subscribe((state) => {
			setSelectedRange(state.name);
		});

		return () => listener();
	}, []);

	const onDurationSelect = (duration: FixedDurations) => {
		subTimeRange.set((state) => {
			state.name = duration.name;
			state.state = 'relative';
			state.startTime = duration.value;
			state.endTime = 'now';
		});
		setOpened(false);
	};

	const { timeRangeContainer, fixedRangeContainer, fixedRangeBtn, customRangeContainer } = classes;

	return (
		<Menu withArrow position="top" opened={opened}>
			<Menu.Target>
				<Button
					variant="default"
					radius={'md'}
					onClick={() => setOpened((o) => !o)}
					leftSection={<IconClock size={px('1.2rem')} stroke={1.5} />}>
					<Text>{selectedRange}</Text>
				</Button>
			</Menu.Target>
			<Menu.Dropdown p={'xs'}>
				<Box className={timeRangeContainer}>
					<Box className={fixedRangeContainer}>
						{FIXED_DURATIONS.map((duration) => {
							return (
								<UnstyledButton
									disabled={selectedRange === duration.name}
									className={fixedRangeBtn}
									key={duration.name}
									onClick={() => onDurationSelect(duration)}>
									{duration.name}
								</UnstyledButton>
							);
						})}
					</Box>
					<Box className={customRangeContainer}>
						<CustomTimeRange setOpened={setOpened} />
					</Box>
				</Box>
			</Menu.Dropdown>
		</Menu>
	);
};

type CustomTimeRangeProps = {
	setOpened: (opened: boolean) => void;
};
const CustomTimeRange: FC<CustomTimeRangeProps> = ({ setOpened }) => {
	const {
		state: { subTimeRange },
	} = useHeaderContext();

	const [selectedRange, setSelectedRange] = useMountedState<{
		startTime: Date | undefined;
		endTime: Date | undefined;
	}>({
		startTime: undefined,
		endTime: undefined,
	});

	const onRangeSelect = (key: keyof typeof selectedRange, date: Date) => {
		setSelectedRange((state) => {
			state[key] = date;
			return { ...state };
		});
	};

	useEffect(() => {
		const TimeRange = subTimeRange.get();
		if (TimeRange.state === 'relative') {
			const Range = FIXED_DURATIONS.find((duration) => duration.name === TimeRange.name);
			if (Range) {
				setSelectedRange({
					startTime: dayjs().subtract(Range.milliseconds, 'milliseconds').toDate(),
					endTime: new Date(),
				});
			}
		} else {
			setSelectedRange({
				startTime: TimeRange.startTime,
				endTime: TimeRange.endTime,
			});
		}
	}, []);

	const onApply = () => {
		const startTime = dayjs(selectedRange.startTime).set('second', 0).set('millisecond', 0).toDate();
		const endTime = dayjs(selectedRange.endTime).set('second', 0).set('millisecond', 0).toDate();
		const startTimeText = dayjs(startTime).format('DD-MM-YY HH:mm:ss');
		const endTimeText = dayjs(endTime).format('DD-MM-YY HH:mm:ss');
		subTimeRange.set((query) => {
			query.startTime = startTime;
			query.endTime = endTime;
			query.state = 'absolute';
			query.name = `${startTimeText} - ${endTimeText}`;
		});
		setOpened(false);
	};

	const { customTimeRangeFooter, customTimeRangeApplyBtn } = classes;

	const isApplicable = useMemo(() => {
		return (
			dayjs(selectedRange.startTime).isSame(subTimeRange.get().startTime, 'minutes') &&
			dayjs(selectedRange.endTime).isSame(subTimeRange.get().endTime, 'minutes')
		);
	}, [selectedRange]);

	const isStartTimeMoreThenEndTime = useMemo(() => {
		return dayjs(selectedRange.startTime).isAfter(selectedRange.endTime, 'seconds');
	}, [selectedRange]);

	return (
		<>
			<DateTimePicker
				error={isStartTimeMoreThenEndTime ? 'Start time cannot be greater than the end time' : ''}
				maxDate={selectedRange.endTime}
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
				minDate={selectedRange.startTime}
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
					color="brandPrimary"
					disabled={isApplicable || isStartTimeMoreThenEndTime}
					className={customTimeRangeApplyBtn}
					onClick={onApply}>
					Apply
				</Button>
			</Box>
		</>
	);
};

export default TimeRange;
