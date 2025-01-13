import { useCallback } from 'react';
import { correlationStoreReducers, useCorrelationStore } from '../providers/CorrelationProvider';
import { Button, px } from '@mantine/core';
import classes from '../styles/SavedCorrelationsBtn.module.css';
import { IconFilterHeart } from '@tabler/icons-react';

const { toggleSavedCorrelationsModal } = correlationStoreReducers;

const SavedCorrelationsButton = () => {
	const [, setLogsStore] = useCorrelationStore(() => null);
	const onClick = useCallback(() => setLogsStore((store) => toggleSavedCorrelationsModal(store, true)), []);
	return (
		<Button
			className={classes.savedCorrelationsBtn}
			h="100%"
			leftSection={<IconFilterHeart size={px('1rem')} stroke={1.5} />}
			onClick={onClick}>
			Saved Correlations
		</Button>
	);
};

export default SavedCorrelationsButton;
