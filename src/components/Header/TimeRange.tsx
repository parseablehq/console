import useMountedState from '@/hooks/useMountedState';
import { Box, Button, Divider, Menu, NumberInput, Stack, Text, Tooltip, px } from '@mantine/core';
import { DatePicker, TimeInput } from '@mantine/dates';
import { IconCalendarEvent, IconCheck, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { Fragment, useCallback, useMemo, useRef, useState } from 'react';
import { FIXED_DURATIONS } from '@/constants/timeConstants';
import classes from './styles/LogQuery.module.css';
import responsive from '@/styles/responsiveText.module.css';
import { useOuterClick } from '@/hooks/useOuterClick';
import _ from 'lodash';
import timeRangeUtils from '@/utils/timeRangeUtils';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { logsStoreReducers, useLogsStore } from '@/pages/Stream/providers/LogsProvider';

const { getRelativeStartAndEndDate } = timeRangeUtils;
const { setTimeRange, setshiftInterval } = appStoreReducers;
const { getCleanStoreForRefetch } = logsStoreReducers;
export type FixedDuration = (typeof FIXED_DURATIONS)[number];

const { timeRangeContainer, fixedRangeBtn, fixedRangeBtnSelected, customRangeContainer, shiftIntervalContainer } =
	classes;

const RelativeTimeIntervals = (props: {
	interval: number;
	onDurationSelect: (fixedDuration: FixedDuration) => void;
}) => {
	const { interval, onDurationSelect } = props;
	return (
		<Stack style={{ flexDirection: 'row' }} gap={0}>
			{_.map(FIXED_DURATIONS, (duration) => {
				return (
					<Stack onClick={() => onDurationSelect(duration)} key={duration.name}>
						<Text className={`${fixedRangeBtn} ${duration.milliseconds === interval ? fixedRangeBtnSelected : ''}`}>
							{duration.label}
						</Text>
					</Stack>
				);
			})}
		</Stack>
	);
};

const TimeRange: FC = () => {
	const [timeRange, setAppStore] = useAppStore((store) => store.timeRange);
	const [, setLogStore] = useLogsStore(() => null);
	const { label, shiftInterval, interval, startTime, endTime, type } = timeRange;
	const handleOuterClick = useCallback((event: any) => {
		const targetClassNames: string[] = event.target?.classList || [];
		const maybeSubmitBtnClassNames: string[] = event.target.closest('button')?.classList || [];
		const classNames: string[] = [
			...(typeof targetClassNames[Symbol.iterator] === 'function' ? [...targetClassNames] : []),
			...(typeof maybeSubmitBtnClassNames[Symbol.iterator] === 'function' ? [...maybeSubmitBtnClassNames] : []),
		];
		const shouldIgnoreClick = classNames.some((className) => {
			return (
				className.startsWith('mantine-DateTimePicker') ||
				className.startsWith('mantine-DatePicker') ||
				className.startsWith('mantine-TimeInput') ||
				className === 'mantine-Popover-dropdown'
			);
		});
		!shouldIgnoreClick && setOpened(false);
	}, []);

	const innerRef = useOuterClick(handleOuterClick);
	const [opened, setOpened] = useMountedState(false);
	const [showTick, setShowTick] = useState(false);
	const shiftIntervalRef = useRef<HTMLInputElement>(null);

	const toggleMenu = useCallback(() => {
		setOpened((prev) => !prev);
	}, []);

	const onDurationSelect = (duration: FixedDuration) => {
		const { startTime, endTime } = getRelativeStartAndEndDate(duration);
		setLogStore((store) => getCleanStoreForRefetch(store));
		setAppStore((store) => setTimeRange(store, { startTime, endTime, type: 'fixed' }));
		setOpened(false);
	};

	const resetToRelative = useCallback(() => {
		const now = dayjs().startOf('minute');
		const startTime = now.subtract(FIXED_DURATIONS[0].milliseconds, 'milliseconds');
		const endTime = now;
		setLogStore((store) => getCleanStoreForRefetch(store));
		setAppStore((store) => setTimeRange(store, { startTime, endTime, type: 'fixed' }));
		setOpened(false);
	}, []);

	const debouncedShowTick = useCallback(
		_.debounce(() => {
			setShowTick(true);
			shiftIntervalRef.current?.blur(); // Remove focus after showing tick
		}, 1000), // 1000ms = 1 second delay
		[],
	);

	const onSetShiftInterval = useCallback((val: number | string) => {
		if (typeof val === 'number') {
			setAppStore((store) => setshiftInterval(store, val));
			setShowTick(false); // Hide the tick when editing starts again
			debouncedShowTick(); // Show the tick after the user stops typing
		}
	}, []);

	const shiftTimeRange = (direction: 'left' | 'right') => {
		const changeInMs = shiftInterval * 60 * 1000;
		if (direction === 'left') {
			const newStartTime = new Date(startTime.getTime() - changeInMs);
			const newEndTime = new Date(endTime.getTime() - changeInMs);
			setLogStore((store) => getCleanStoreForRefetch(store));
			setAppStore((store) =>
				setTimeRange(store, { startTime: dayjs(newStartTime), endTime: dayjs(newEndTime), type: 'custom' }),
			);
		} else {
			const newStartTime = new Date(startTime.getTime() + changeInMs);
			const newEndTime = new Date(endTime.getTime() + changeInMs);
			setLogStore((store) => getCleanStoreForRefetch(store));
			setAppStore((store) =>
				setTimeRange(store, { startTime: dayjs(newStartTime), endTime: dayjs(newEndTime), type: 'custom' }),
			);
		}
	};

	const shiftLabelPrefix = `Shift ${shiftInterval} Mins`;

	return (
		<Menu withArrow position="top" opened={opened}>
			<Menu.Target>
				<Stack className={classes.timeRangeBtnContainer}>
					<Tooltip label={`${shiftLabelPrefix} Back`}>
						<Stack className={classes.timeRangeCtrlIcon} onClick={() => shiftTimeRange('left')}>
							<IconChevronLeft stroke={2} size="1rem" style={{ cursor: 'pointer' }} />
						</Stack>
					</Tooltip>
					<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={0}>
						{type === 'fixed' ? (
							<RelativeTimeIntervals interval={interval} onDurationSelect={onDurationSelect} />
						) : (
							<Text
								onClick={toggleMenu}
								className={responsive.responsiveText}
								style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
								{label}
							</Text>
						)}
						<Stack onClick={toggleMenu} px={10} className="calenderIcon">
							<IconCalendarEvent size={px('1rem')} stroke={1.5} style={{ cursor: 'pointer' }} />
						</Stack>
					</Stack>
					<Tooltip label={`${shiftLabelPrefix} Forward`}>
						<Stack className={classes.timeRangeCtrlIcon} onClick={() => shiftTimeRange('right')}>
							<IconChevronRight stroke={2} size="1rem" style={{ cursor: 'pointer' }} />
						</Stack>
					</Tooltip>
				</Stack>
			</Menu.Target>
			<Menu.Dropdown>
				<div ref={innerRef}>
					<Box className={timeRangeContainer}>
						<Stack className={customRangeContainer}>
							<Stack className={shiftIntervalContainer}>
								<Text className={classes.shiftIntervalLabel} ta="center">
									Shift Interval (In Mins)
								</Text>
								<Stack gap={12} style={{ flexDirection: 'row', alignItems: 'center' }}>
									<NumberInput
										ref={shiftIntervalRef}
										w={100}
										min={1}
										value={shiftInterval}
										onChange={onSetShiftInterval}
									/>
									<IconCheck color={showTick ? 'green' : 'white'} stroke={1.8} size="1rem" />
								</Stack>
							</Stack>
							<Divider mt={3} />
							<CustomTimeRange setOpened={setOpened} resetToRelative={resetToRelative} />
						</Stack>
					</Box>
				</div>
			</Menu.Dropdown>
		</Menu>
	);
};

type CustomTimeRangeProps = {
	setOpened: (opened: boolean) => void;
	resetToRelative: () => void;
};

function normalizeDate(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isDateInRange(startDate: Date, endDate: Date, currentDate: Date) {
	const normalizedStart = normalizeDate(startDate);
	const normalizedEnd = normalizeDate(endDate);
	const normalizedTest = normalizeDate(currentDate);

	return (
		(normalizedTest >= normalizedStart && normalizedTest <= normalizedEnd) ||
		normalizedTest.getTime() === normalizedStart.getTime() ||
		normalizedTest.getTime() === normalizedEnd.getTime()
	);
}

const CustomTimeRange: FC<CustomTimeRangeProps> = ({ setOpened, resetToRelative }) => {
	const [, setLogStore] = useLogsStore(() => null);
	const [{ startTime: startTimeFromStore, endTime: endTimeFromStore, type }, setAppStore] = useAppStore(
		(store) => store.timeRange,
	);

	const [localSelectedRange, setLocalSelectedRange] = useState({
		startTime: _.clone(startTimeFromStore),
		endTime: _.clone(endTimeFromStore),
	});

	const onRangeSelect = (key: keyof typeof localSelectedRange, date: Date) => {
		setLocalSelectedRange((state) => {
			const year = date.getFullYear();
			const month = date.getMonth();
			const day = date.getDate();
			const newDate = state[key];
			newDate.setFullYear(year, month, day);
			state[key] = newDate;
			return { ...state };
		});
	};

	const onTimeSelect = (key: keyof typeof localSelectedRange, time: string) => {
		setLocalSelectedRange((state) => {
			const [hours, minutes] = time.split(':').map(Number);
			if (isNaN(hours) || isNaN(minutes)) return state;
			const updatedDate = new Date(state[key]);
			updatedDate.setHours(hours, minutes, 0, 0);
			return { ...state, [key]: updatedDate };
		});
	};

	const onApply = () => {
		setLogStore((store) => getCleanStoreForRefetch(store));
		setAppStore((store) =>
			setTimeRange(store, {
				type: 'custom',
				startTime: dayjs(localSelectedRange.startTime).startOf('minute'),
				endTime: dayjs(localSelectedRange.endTime).startOf('minute'),
			}),
		);
		setOpened(false);
	};

	const { customTimeRangeFooter, customTimeRangeApplyBtn } = classes;

	const isApplicable = useMemo(() => {
		return (
			dayjs(localSelectedRange.startTime).isSame(startTimeFromStore, 'seconds') &&
			dayjs(localSelectedRange.endTime).isSame(endTimeFromStore, 'seconds')
		);
	}, [localSelectedRange]);

	const isStartTimeMoreThenEndTime = useMemo(() => {
		return dayjs(localSelectedRange.startTime).isAfter(localSelectedRange.endTime, 'seconds');
	}, [localSelectedRange]);
	const startingTime = (() => {
		const hours = localSelectedRange.startTime.getHours().toString().padStart(2, '0');
		const minutes = localSelectedRange.startTime.getMinutes().toString().padStart(2, '0');
		return `${hours}:${minutes}`;
	})();
	const endingTime = (() => {
		const hours = localSelectedRange.endTime.getHours().toString().padStart(2, '0');
		const minutes = localSelectedRange.endTime.getMinutes().toString().padStart(2, '0');
		return `${hours}:${minutes}`;
	})();

	const highlightDate = useCallback(
		(date: Date, key: keyof typeof localSelectedRange) => {
			const day = date.getDate();
			const selectedDate = localSelectedRange[key];
			const isNotSelectedDate = selectedDate.toLocaleDateString() !== date.toLocaleDateString();

			const shouldHighlight =
				!isStartTimeMoreThenEndTime &&
				isNotSelectedDate &&
				isDateInRange(localSelectedRange.startTime, localSelectedRange.endTime, date);
			return (
				<div className={`${classes.calendarDate} ${shouldHighlight ? classes.highlightDate : ''}`}>
					<div>{day}</div>
				</div>
			);
		},
		[localSelectedRange, isStartTimeMoreThenEndTime],
	);

	return (
		<Fragment>
			<Text style={{ fontSize: '0.7rem', fontWeight: 500 }}>Absolute Range</Text>
			<Stack style={{ flexDirection: 'row', alignItems: 'flex-start' }} gap={30}>
				<Stack className={classes.datePickerContainer}>
					<DatePicker
						value={localSelectedRange.startTime}
						onChange={(date) => {
							if (date) {
								onRangeSelect('startTime', date);
							}
						}}
						renderDay={(date) => highlightDate(date, 'startTime')}
					/>
					<TimeInput
						error={isStartTimeMoreThenEndTime && 'Start time must be earlier than end time.'}
						value={startingTime}
						onChange={(e) => onTimeSelect('startTime', e.currentTarget.value)}
					/>
				</Stack>
				<Stack className={classes.datePickerContainer}>
					<DatePicker
						value={localSelectedRange.endTime}
						onChange={(date) => {
							if (date) {
								onRangeSelect('endTime', date);
							}
						}}
						renderDay={(date) => highlightDate(date, 'endTime')}
					/>
					<TimeInput value={endingTime} onChange={(e) => onTimeSelect('endTime', e.currentTarget.value)} />
				</Stack>
			</Stack>
			<Stack style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
				<Box className={customTimeRangeFooter}>
					<Button className={customTimeRangeApplyBtn} disabled={type === 'fixed'} onClick={resetToRelative}>
						Clear
					</Button>
				</Box>
				<Box className={customTimeRangeFooter}>
					<Button
						className={customTimeRangeApplyBtn}
						disabled={isApplicable || isStartTimeMoreThenEndTime}
						onClick={onApply}>
						Apply
					</Button>
				</Box>
			</Stack>
		</Fragment>
	);
};

export default TimeRange;
