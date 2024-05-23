import useMountedState from '@/hooks/useMountedState';
import { Box, Button, Divider, Menu, NumberInput, Stack, Text, UnstyledButton, px } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconChevronLeft, IconChevronRight, IconClock } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { Fragment, useCallback, useMemo } from 'react';
import { FIXED_DURATIONS, FIXED_DURATIONS_LABEL } from '@/constants/timeConstants';
import classes from './styles/LogQuery.module.css';
import { useOuterClick } from '@/hooks/useOuterClick';
import { logsStoreReducers, useLogsStore } from '@/pages/Stream/providers/LogsProvider';

const {setTimeRange, setshiftInterval} = logsStoreReducers;
type FixedDurations = (typeof FIXED_DURATIONS)[number];

const {
	timeRangeBTn,
	timeRangeContainer,
	fixedRangeContainer,
	fixedRangeBtn,
	fixedRangeBtnSelected,
	customRangeContainer,
	shiftIntervalContainer
} = classes;

const TimeRange: FC = () => {
	const [timeRange, setLogsStore] = useLogsStore(store => store.timeRange);
	const {label, shiftInterval, interval, startTime, endTime} = timeRange;
	const handleOuterClick = useCallback((event: any) => {
		const targetClassNames:  string[] = event.target?.classList || [];
		const maybeSubmitBtnClassNames: string[] = event.target.closest('button')?.classList || [];
		const classNames: string[] = [
			...(typeof targetClassNames[Symbol.iterator] === 'function'  ? [...targetClassNames] : []),
			...(typeof maybeSubmitBtnClassNames[Symbol.iterator] === 'function'  ? [...maybeSubmitBtnClassNames] : []),
		];
		const shouldIgnoreClick = classNames.some((className) => {
			return (
				className.startsWith('mantine-DateTimePicker') ||
				className.startsWith('mantine-TimeInput') ||
				className === 'mantine-Popover-dropdown'
			);
		});
		!shouldIgnoreClick && setOpened(false);
	}, []);

	const innerRef = useOuterClick(handleOuterClick);
	const [opened, setOpened] = useMountedState(false);

	const toggleMenu = useCallback(() => {
		setOpened((prev) => !prev);
	}, []);

	const onDurationSelect = (duration: FixedDurations) => {
		const now = dayjs().startOf('minute');
		const startTime = now.subtract(duration.milliseconds, 'milliseconds');
		const endTime = now;
		setLogsStore((store) => setTimeRange(store, { startTime, endTime, type: 'fixed' }));
		setOpened(false);
	};

	const onSetShiftInterval = useCallback((val: number | string) => {
		if (typeof val === 'number') {
			setLogsStore(store => setshiftInterval(store, val))
		}
	}, [])

	const shiftTimeRange = (direction: 'left' | 'right') => {
		const changeInMs = shiftInterval * 60 * 1000;
		if (direction === 'left') {
			const newStartTime = new Date(startTime.getTime() - changeInMs);
			const newEndTime = new Date(endTime.getTime() - changeInMs);
			setLogsStore((store) =>
				setTimeRange(store, { startTime: dayjs(newStartTime), endTime: dayjs(newEndTime), type: 'custom' }),
			);
		} else {
			const newStartTime = new Date(startTime.getTime() + changeInMs);
			const newEndTime = new Date(endTime.getTime() + changeInMs);
			setLogsStore((store) =>
				setTimeRange(store, { startTime: dayjs(newStartTime), endTime: dayjs(newEndTime), type: 'custom' }),
			);
		}
	}

	return (
		<Menu withArrow position="top" opened={opened}>
			<Menu.Target>
				<Stack className={classes.timeRangeBtnContainer}>
					<Stack className={classes.timeRangeCtrlIcon} onClick={() => shiftTimeRange('left')}>
						<IconChevronLeft style={{ cursor: 'pointer' }} />
					</Stack>
					<Button
						className={timeRangeBTn}
						leftSection={<IconClock size={px('1.2rem')} stroke={1.5} />}
						onClick={toggleMenu}>
						{FIXED_DURATIONS_LABEL[label] || label}
					</Button>
					<Stack className={classes.timeRangeCtrlIcon} onClick={() => shiftTimeRange('right')}>
						<IconChevronRight style={{ cursor: 'pointer' }} />
					</Stack>
				</Stack>
			</Menu.Target>
			<Menu.Dropdown>
				<div ref={innerRef}>
					<Box className={timeRangeContainer}>
						<Box className={fixedRangeContainer}>
							{FIXED_DURATIONS.map((duration) => {
								return (
									<UnstyledButton
										disabled={interval === duration.milliseconds}
										className={[fixedRangeBtn, interval === duration.milliseconds && fixedRangeBtnSelected]
											.filter(Boolean)
											.join(' ')}
										key={duration.name}
										onClick={() => onDurationSelect(duration)}>
										{duration.name}
									</UnstyledButton>
								);
							})}
						</Box>
						<Stack className={customRangeContainer}>
							<Stack className={shiftIntervalContainer}>
								<Text className={classes.shiftIntervalLabel} ta="center">
									Jump Interval
								</Text>
								<NumberInput w={100} min={1} value={shiftInterval} onChange={onSetShiftInterval} />
							</Stack>
							<Divider mt={3} />
							<CustomTimeRange setOpened={setOpened} />
						</Stack>
					</Box>
				</div>
			</Menu.Dropdown>
		</Menu>
	);
};

type CustomTimeRangeProps = {
	setOpened: (opened: boolean) => void;
};
const CustomTimeRange: FC<CustomTimeRangeProps> = ({ setOpened }) => {
	const [{startTime, endTime} ,setLogsStore] = useLogsStore(store => store.timeRange)

	const [localSelectedRange, setLocalSelectedRange] = useMountedState({
		startTime,
		endTime,
	});

	const onRangeSelect = (key: keyof typeof localSelectedRange, date: Date) => {
		setLocalSelectedRange((state) => {
			state[key] = date;
			return { ...state };
		});
	};

	const onApply = () => {
		setLogsStore((store) =>
			setTimeRange(store, {
				type: 'custom',
				startTime: dayjs(localSelectedRange.startTime),
				endTime: dayjs(localSelectedRange.endTime),
			}),
		);
		setOpened(false);
	};

	const { customTimeRangeFooter, customTimeRangeApplyBtn } = classes;

	const isApplicable = useMemo(() => {
		return (
			dayjs(localSelectedRange.startTime).isSame(startTime, 'seconds') &&
			dayjs(localSelectedRange.endTime).isSame(endTime, 'seconds')
		);
	}, [localSelectedRange]);

	const isStartTimeMoreThenEndTime = useMemo(() => {
		return dayjs(localSelectedRange.startTime).isAfter(localSelectedRange.endTime, 'seconds');
	}, [localSelectedRange]);

	return (
		<Fragment>
			<Text style={{fontSize: '0.9rem', fontWeight: 500}}>Custom Range</Text>
			<DateTimePicker
				error={isStartTimeMoreThenEndTime ? 'Start time cannot be greater than the end time' : ''}
				maxDate={new Date()}
				value={localSelectedRange.startTime}
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
				value={localSelectedRange.endTime}
				onChange={(date) => {
					if (date) {
						onRangeSelect('endTime', date);
					}
				}}
				valueFormat="DD-MM-YY HH:mm"
				label="To"
				placeholder="Pick date and time"
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
