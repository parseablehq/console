import useMountedState from '@/hooks/useMountedState';
import { Box, Button, Menu, Text, UnstyledButton, px } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconClock, IconRefresh, IconRefreshOff, } from '@tabler/icons-react';
import dayjs from 'dayjs';
import ms from 'ms';
import type { FC } from 'react';
import { Fragment, useEffect, useMemo } from 'react';
import { FIXED_DURATIONS, REFRESH_INTERVALS, useQueryPageContext } from './Context';
import { useQueryStyles } from './styles';

const SecondaryHeader: FC = () => {
    const { classes } = useQueryStyles();
    const { container, innerContainer, labelStyle } = classes;

    return (
		<Box className={container}>
			<Box>
				<Text className={labelStyle}>Time Range</Text>
				<Box className={innerContainer}>
					<TimeRange />
					<RefreshInterval />
				</Box>
			</Box>
		</Box>

    );
};


const RefreshInterval: FC = () => {
    const {
        state: { subRefreshInterval },
    } = useQueryPageContext();

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

    const { classes } = useQueryStyles();
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
    } = useQueryPageContext();

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
        return;
    };

    const { classes, cx } = useQueryStyles();
    const {
        timeRangeBTn,
        timeRangeContainer,
        fixedRangeContainer,
        fixedRangeBtn,
        fixedRangeBtnSelected,
        customRangeContainer,
    } = classes;

    return (
        <Menu withArrow position="top-start">
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
    } = useQueryPageContext();

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

    const { classes } = useQueryStyles();
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

export default SecondaryHeader;
