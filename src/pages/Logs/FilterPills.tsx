import { ActionIcon, Badge, Group, rem } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { type FC, Fragment, useMemo, useCallback } from 'react';
import { logsStoreReducers, useLogsStore } from './providers/LogsProvider';

const { deleteFilterItem } = logsStoreReducers;

type RemoveButton = {
	onClick: () => void;
};

const RemoveButton: FC<RemoveButton> = (props) => {
	const { onClick } = props;
	return (
		<ActionIcon {...props} size="xs" m={0} radius="xl" color="red" onClick={onClick}>
			<IconX size={rem(8)} stroke={4} />
		</ActionIcon>
	);
};

const FilterPills: FC = () => {
	const [quickFilters, setLogsStore] = useLogsStore((store) => store.quickFilters);
	const filters = useMemo(() => Object.keys(quickFilters.filters), [quickFilters]);
	const onRemove = useCallback((key: string) => {
		setLogsStore((store) => deleteFilterItem(store, key));
	}, []);

	return (
		<Fragment>
			{filters.length ? (
				<Group justify="left" mt="md" ml="md">
					{filters.map((key) => {
						return (
							<Badge
								key={key}
								color="brandPrimary.4"
								variant="filled"
								pr={0}
								rightSection={<RemoveButton onClick={() => onRemove(key)} />}>
								{`${key} (${quickFilters.filters[key].length})`}
							</Badge>
						);
					})}
				</Group>
			) : null}
		</Fragment>
	);
};

export default FilterPills;
