import { ActionIcon, Badge, Group, rem } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { type FC, Fragment, useCallback } from 'react';
import _ from 'lodash';
import { useLogsStore, logsStoreReducers } from '../providers/LogsProvider';

const { setAndFilterData } = logsStoreReducers;

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
	const [filters, setLogsStore] = useLogsStore((store) => store.tableOpts.filters);
	const onRemove = useCallback((key: string) => {
		setLogsStore((store) => setAndFilterData(store, key, [], true));
	}, []);

	return (
		<Fragment>
			{!_.isEmpty(filters) ? (
				<Group justify="left" mt="md" ml="md">
					{_.map(filters, (_v, k) => {
						return (
							<Badge
								key={k}
								color="brandPrimary.4"
								variant="filled"
								pr={0}
								rightSection={<RemoveButton onClick={() => onRemove(k)} />}>
								{`${k} (${filters[k].length})`}
							</Badge>
						);
					})}
				</Group>
			) : null}
		</Fragment>
	);
};

export default FilterPills;
