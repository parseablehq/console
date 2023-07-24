import useMountedState from '@/hooks/useMountedState';
import { Box, Breadcrumbs, Button, Menu, Text, TextInput, UnstyledButton, px } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconClock, IconRefresh, IconReload, IconRefreshOff, IconSearch } from '@tabler/icons-react';
import dayjs from 'dayjs';
import ms from 'ms';
import type { ChangeEvent, FC, KeyboardEvent } from 'react';
import { Fragment, useEffect, useMemo } from 'react';
import { FIXED_DURATIONS, REFRESH_INTERVALS, useHeaderContext } from '@/layouts/MainLayout/Context';
import { useLogQueryStyles } from './styles';
import { useMatch } from 'react-router-dom';
const SubHeader: FC = () => {
	const { classes } = useLogQueryStyles();
	const { container, innerContainer, homeIcon, activeBtn } = classes;
	const {
		state: { subLogQuery },
	} = useHeaderContext();
	const [streamName, setStreamName] = useMountedState(subLogQuery.get().streamName);

	useEffect(() => {
		const listener = subLogQuery.subscribe((state) => {
			setStreamName(state.streamName);
		});
		return () => listener();
	}, []);

	return (
		<Box className={container}>
			<Box>
				<Box className={innerContainer}>
					<Breadcrumbs separator=">">
						<svg
							className={homeIcon}
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none">
							<path
								d="M9.99998 19V14H14V19C14 19.55 14.45 20 15 20H18C18.55 20 19 19.55 19 19V12H20.7C21.16 12 21.38 11.43 21.03 11.13L12.67 3.6C12.29 3.26 11.71 3.26 11.33 3.6L2.96998 11.13C2.62998 11.43 2.83998 12 3.29998 12H4.99998V19C4.99998 19.55 5.44998 20 5.99998 20H8.99998C9.54998 20 9.99998 19.55 9.99998 19Z"
								fill="#211F1F"
							/>
						</svg>
						<Text>Streams </Text>
						<Text>{streamName}</Text>
						{useMatch('/:streamName/stats') && <Text className={activeBtn}>Stats </Text>}

						{useMatch('/:streamName/logs') && <Text className={activeBtn}>Logs </Text>}

						{useMatch('/:streamName/query') && <Text className={activeBtn}>Query </Text>}
					</Breadcrumbs>
				</Box>
			</Box>

			<Box>
				<Box className={innerContainer}>
					{useMatch('/:streamName/stats') && <RefreshNow />}

					{useMatch('/:streamName/logs') && <>
						<Search />
						<RefreshNow />
						<TimeRange />
						<RefreshInterval />
					</>}

					{useMatch('/:streamName/query') && <>
						<TimeRange />
						<RefreshInterval />
					</>}

				</Box>
			</Box>
		</Box>
	);
};

const Search: FC = () => {
	const {
		state: { subLogSearch },
	} = useHeaderContext();

	const [searchValue, setSearchValue] = useMountedState('');
	const { classes } = useLogQueryStyles();

	useEffect(() => {
		const listener = subLogSearch.subscribe((interval) => {
			setSearchValue(interval.search);
		});
		return () => {
			listener();
		};
	}, []);
	const { searchContainer, searchInput } = classes;

	const onSearchValueChange = (event: ChangeEvent<HTMLInputElement>) => {
		setSearchValue(event.currentTarget.value);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			if (subLogSearch.get().search !== searchValue) {
				const trimmedValue = event.currentTarget.value.trim();
				subLogSearch.set((query) => {
					query.search = trimmedValue;
				});
				setSearchValue(trimmedValue);
			}
		}
	};

	return (
		<Box className={searchContainer}>
			{/* TODO: Disabled for now, need to find a proper way to handle SQL search */}
			{/* <SearchTypeSelector /> */}
			<TextInput
				className={searchInput}
				value={searchValue}
				onKeyDown={handleKeyDown}
				onChange={onSearchValueChange}
				placeholder="Search"
				icon={<IconSearch size={px('1.2rem')} stroke={1.5} />}
			/>
		</Box>
	);
};

const RefreshNow: FC = () => {
	const {
		state: { subLogQuery, subLogSelectedTimeRange },
	} = useHeaderContext();

	const onRefresh = () => {
		if (subLogSelectedTimeRange.get().includes('Past')) {
			const now = dayjs();
			const timeDiff = subLogQuery.get().endTime.getTime() - subLogQuery.get().startTime.getTime();
			subLogQuery.set((state) => {
				state.startTime = now.subtract(timeDiff).toDate();
				state.endTime = now.toDate();
			});
		}
	};
	const { classes } = useLogQueryStyles();
	const { refreshNowBtn } = classes;

	return (
		<Button className={refreshNowBtn} onClick={onRefresh}>
			<IconReload size={px('1.2rem')} stroke={1.5} />
		</Button>
	);
};

const RefreshInterval: FC = () => {
	const {
		state: { subRefreshInterval },
	} = useHeaderContext();

	const [selectedInterval, setSelectedInterval] = useMountedState<number | null>(subRefreshInterval.get());

	useEffect(() => {
		const listener = subRefreshInterval.subscribe((interval) => {
			setSelectedInterval(interval);
		});

		return () => listener();
	}, []);

	const Icon = useMemo(() => (selectedInterval ? IconRefresh : IconRefreshOff), [selectedInterval]);

	const onSelectedInterval = (interval: number | null) => {
		subRefreshInterval.set(interval);
	};

	const { classes } = useLogQueryStyles();
	const { intervalBtn } = classes;

	return (
		<Menu withArrow>
			<Menu.Target>
				<Button className={intervalBtn} rightIcon={<Icon size={px('1.2rem')} stroke={1.5} />}>
					<Text>{selectedInterval ? ms(selectedInterval) : 'Off'}</Text>
				</Button>
			</Menu.Target>
			<Menu.Dropdown>
				{REFRESH_INTERVALS.map((interval) => {
					if (interval === selectedInterval) return null;

					return (
						<Menu.Item key={interval} onClick={() => onSelectedInterval(interval)}>
							<Text>{ms(interval)}</Text>
						</Menu.Item>
					);
				})}

				{selectedInterval !== null && (
					<Menu.Item onClick={() => onSelectedInterval(null)}>
						<Text>Off</Text>
					</Menu.Item>
				)}
			</Menu.Dropdown>
		</Menu>
	);
};

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

export default SubHeader;
