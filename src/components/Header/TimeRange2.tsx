import useMountedState from '@/hooks/useMountedState';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Popover, Text, Button, ActionIcon, rem } from '@mantine/core';
import { DatePicker, TimeInput } from '@mantine/dates';
import { IconClock } from '@tabler/icons-react';
import { FC, useEffect, useRef, useState } from 'react';

const TimeRange: FC = () => {
	const [value, setValue] = useState<[Date | null, Date | null]>([null, null]);
	const ref = useRef<HTMLInputElement>(null);
	const {
		state: { subTimeRange },
	} = useHeaderContext();
	const [selectedRange, setSelectedRange] = useMountedState<string>(subTimeRange.get().value);

	useEffect(() => {
		const listener = subTimeRange.subscribe((state) => {
			setSelectedRange(state.value);
		});

		return () => listener();
	}, []);


	const pickerControl = (
		<ActionIcon variant="subtle" color="gray" onClick={() => ref.current?.showPicker()}>
			<IconClock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
		</ActionIcon>
	);

	return (
		<Popover position="bottom" withArrow shadow="md">
			<Popover.Target>
				<Button>{selectedRange}</Button>
			</Popover.Target>
			<Popover.Dropdown>
				<DatePicker type="range" allowSingleDateInRange value={value} onChange={setValue} />
				<TimeInput label="Click icon to show browser picker" ref={ref} rightSection={pickerControl} />
				<TimeInput label="Click icon to show browser picker" ref={ref} rightSection={pickerControl} />
			</Popover.Dropdown>
		</Popover>
	);
};
export default TimeRange;
