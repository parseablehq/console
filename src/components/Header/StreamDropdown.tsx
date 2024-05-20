import { Select } from '@mantine/core';
import { useCallback, useEffect, useRef } from 'react';
import classes from './styles/LogQuery.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';

const StreamDropdown = () => {
	const { streamName } = useParams();

	const [currentStream] = useAppStore(store => store.currentStream)
	const [userSpecificStreams] = useAppStore(store => store.userSpecificStreams)
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
			// description="Stream"
			className={classes.streamSelect}
			onChange={handleChange}
			data={userSpecificStreams?.map((stream: any) => ({ value: stream.name, label: stream.name })) ?? []}
		/>
	);
};

export default StreamDropdown;
