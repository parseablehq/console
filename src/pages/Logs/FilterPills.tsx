import { ActionIcon, Badge, Group, rem } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useEffect, type FC, Fragment, useMemo } from 'react';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import useMountedState from '@/hooks/useMountedState';

type RemoveButton = {
	onClick: () => void;
};

const RemoveButton: FC<RemoveButton> = (props) => {
	const { onClick } = props;
	return (
		<ActionIcon {...props} size="xs" m={0} radius="xl" color="red" onClick={onClick}>
			<IconX size={rem(11)} stroke={4} />
		</ActionIcon>
	);
};

const FilterPills: FC = () => {
	const {
		state: { subLogSearch },
	} = useHeaderContext();
	const [search, setSearch] = useMountedState(subLogSearch.get());

	useEffect(() => {
		const listener = subLogSearch.subscribe(setSearch);
		return () => {
			listener();
		};
	}, []);

	const filters = useMemo(() => Object.keys(search.filters), [search]);

	const onRemove = (key: string) => {
		subLogSearch.set((state) => {
			delete state.filters[key];
		});
	};

	return (
		<Fragment>
			{filters.length ? (
				<Group position="left" mt="md" ml="md">
					{filters.map((key) => {
						return (
							<Badge
								key={key}
								color="brandPrimary.0"
								variant="filled"
								pr={0}
								rightSection={<RemoveButton onClick={() => onRemove(key)} />}>
								{`${key} (${search.filters[key].length})`}
							</Badge>
						);
					})}
				</Group>
			) : null}
		</Fragment>
	);
};

export default FilterPills;
