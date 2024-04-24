import useMountedState from '@/hooks/useMountedState';
import { Box, Button, Menu, Tooltip, UnstyledButton, px } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconClock } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { Fragment, useCallback, useMemo } from 'react';
import { FIXED_DURATIONS, FIXED_DURATIONS_LABEL } from '@/constants/timeConstants';
import logQueryStyles from './styles/LogQuery.module.css';
import { useOuterClick } from '@/hooks/useOuterClick';
import { logsStoreReducers, useLogsStore } from '@/pages/Logs/providers/LogsProvider';

const {setTimeRange} = logsStoreReducers;
type FixedDurations = (typeof FIXED_DURATIONS)[number];

const TimeRange: FC = () => {
	const [, setLogsStore] = useLogsStore(store => store.timeRange)
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
	const [{label}] = useLogsStore(store => store.timeRange)

	const toggleMenu = useCallback(() => {
		setOpened((prev) => !prev);
	}, []);

	const onDurationSelect = (duration: FixedDurations) => {
		const label =  duration.name;
		const now = dayjs().startOf('minute');
		const startTime = now.subtract(duration.milliseconds, 'milliseconds').toDate();
		const endTime = now.toDate();
		setLogsStore((store) => setTimeRange(store, {startTime, endTime, label, type: 'fixed'}));
		setOpened(false);
	};

	const {
		timeRangeBTn,
		timeRangeContainer,
		fixedRangeContainer,
		fixedRangeBtn,
		fixedRangeBtnSelected,
		customRangeContainer,
	} = logQueryStyles;

	return (
		<Menu withArrow position="top" opened={opened}>
			<Menu.Target>
				<Tooltip label="Time Range">
					<Button
						className={timeRangeBTn}
						leftSection={<IconClock size={px('1.2rem')} stroke={1.5} />}
						onClick={toggleMenu}>
						{FIXED_DURATIONS_LABEL[label] || label}
					</Button>
				</Tooltip>
			</Menu.Target>
			<Menu.Dropdown>
				<div ref={innerRef}>
					<Box className={timeRangeContainer}>
						<Box className={fixedRangeContainer}>
							{FIXED_DURATIONS.map((duration) => {
								return (
									<UnstyledButton
										disabled={label === duration.name}
										className={[fixedRangeBtn, label === duration.name && fixedRangeBtnSelected]
											.filter(Boolean)
											.join(' ')}
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
		const startTimeLabel = dayjs(localSelectedRange.startTime).format('DD-MM-YY HH:mm');
		const endTimeLabel = dayjs(localSelectedRange.endTime).format('DD-MM-YY HH:mm');
		setLogsStore((store) =>
			setTimeRange(store, {
				type: 'custom',
				label: `${startTimeLabel} - ${endTimeLabel}`,
				startTime: localSelectedRange.startTime,
				endTime: localSelectedRange.endTime,
			}),
		);
		setOpened(false);
	};

	const { customTimeRangeFooter, customTimeRangeApplyBtn } = logQueryStyles;

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
