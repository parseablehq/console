import { Button, rem } from '@mantine/core';
import { correlationStoreReducers, useCorrelationStore } from '../providers/CorrelationProvider';
import { useCallback } from 'react';
import { IconTable } from '@tabler/icons-react';
import classes from '../styles/Correlation.module.css';

const { onToggleView } = correlationStoreReducers;

const ViewToggle = () => {
	const [viewMode, setCorrelationStore] = useCorrelationStore((store) => store.viewMode);
	const iconProps = {
		style: { width: rem(20), height: rem(20), display: 'block' },
		stroke: 1.8,
	};
	const onToggle = useCallback(() => {
		setCorrelationStore((store) => onToggleView(store, viewMode === 'table' ? 'json' : 'table'));
	}, [viewMode]);

	const isActive = viewMode === 'table';
	return (
		<Button
			className={classes.savedFiltersBtn}
			h="100%"
			style={{
				backgroundColor: isActive ? '#535BEB' : 'white',
				color: isActive ? 'white' : 'black',
			}}
			onClick={onToggle}
			leftSection={<IconTable {...iconProps} />}>
			Table View
		</Button>
	);
};

export default ViewToggle;
