import useMountedState from '@/hooks/useMountedState';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Box, Button, Menu, Tooltip, UnstyledButton, px } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconClock } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { Fragment, useCallback, useEffect, useMemo } from 'react';
import { FIXED_DURATIONS, FIXED_DURATIONS_LABEL } from '@/constants/timeConstants';
import logQueryStyles from './styles/LogQuery.module.css';
import { useOuterClick } from '@/hooks/useOuterClick';

type FixedDurations = (typeof FIXED_DURATIONS)[number];

const TimeRange: FC = () => {
	const {
		state: { subLogQuery, subLogSelectedTimeRange },
	} = useHeaderContext();

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
	const [selectedRange, setSelectedRange] = useMountedState<string>(subLogSelectedTimeRange.get().value);

	const toggleMenu = useCallback(() => {
		setOpened((prev) => !prev);
	}, []);

	useEffect(() => {
		const listener = subLogSelectedTimeRange.subscribe((state) => {
			setSelectedRange(state.value);
		});

		return () => listener();
	}, []);

	const onDurationSelect = (duration: FixedDurations) => {
		subLogSelectedTimeRange.set((state) => {
			state.value = duration.name;
			state.state = 'fixed';
		});
		const now = dayjs().startOf('minute');

		subLogQuery.set((query) => {
			query.startTime = now.subtract(duration.milliseconds, 'milliseconds').toDate();
			query.endTime = now.toDate();
		});
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
						{FIXED_DURATIONS_LABEL[selectedRange] || selectedRange}
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
										disabled={selectedRange === duration.name}
										className={[fixedRangeBtn, selectedRange === duration.name && fixedRangeBtnSelected]
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
		subLogSelectedTimeRange.set((state) => {
			state.state = 'custom';
			state.value = `${startTime} - ${endTime}`;
		});
		setOpened(false);
	};

	const { customTimeRangeFooter, customTimeRangeApplyBtn } = logQueryStyles;

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
