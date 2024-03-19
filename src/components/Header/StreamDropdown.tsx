import { Select } from '@mantine/core';
import { useCallback, useEffect, useRef } from 'react';
import classes from './styles/LogQuery.module.css';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/layouts/MainLayout/AppProvider';

const StreamDropdown = () => {
	const {
		state: {  userSpecficStreams },
	} = useHeaderContext();
	const { streamName } = useParams();

	const [currentStream] = useAppStore(store => store.currentStream)
	const valueRef = useRef<string | null>(currentStream);
	const navigate = useNavigate();

	const handleChange: (value: string | null) => void = useCallback((value: string | null) => {
		if (value === null) return;

		valueRef.current = value;
		navigate(`/${value}/logs`);
	}, []);

	useEffect(() => {
		valueRef.current = streamName || null;
	}, [streamName])

	return (
		<Select
			searchable
			limit={20}
			value={valueRef.current}
			classNames={{ input: classes.streamInput, description: classes.streamSelectDescription }}
			description="Stream"
			className={classes.streamSelect}
			onChange={handleChange}
			data={userSpecficStreams?.map((stream: any) => ({ value: stream.name, label: stream.name })) ?? []}
		/>
	);
};

export default StreamDropdown;
